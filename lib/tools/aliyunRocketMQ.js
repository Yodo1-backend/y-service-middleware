/**
 * @author XiaChengxing
 * @date 2019/7/16 11:47 AM
 */

const { MQClient, MessageProperties } = require('@aliyunmq/mq-http-sdk');
var middleware = module.exports = {};
middleware.createClient = function ({endpoint, accessKeyId, accessKeySecret, callback}) {
  if (!endpoint || !accessKeyId || !accessKeySecret) {
    throw new Error('endpoint, accessKeyId, accessKeySecret must exist');
  }

  const client = new MQClient(endpoint, accessKeyId, accessKeySecret);
  if (typeof callback === 'function') {
    callback('Plugin AliyunRocketMQ init successful with config ', {
      endpoint: endpoint,
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
      client: client
    })
  }

  var mqClient = {};
  /**
   * 向主题发送一条消息
   * params A: {
   *    topic: topic name
   *    instanceId: rocketMQ instance id
   *    delayTime: delay publish time, default is 0
   * }
   * params B: {
   *    propertyKey: property key, optional
   *    propertyValue: property value, optional
   *    messageKey: message key, optional
   *    message: message body
   *    tag: tag name
   * }
   */
  mqClient.publishMessage = async function ({topic, instanceId, delayTime = 0}, {propertyKey, propertyValue, messageKey, message, tag}, callback = null) {
    if (!topic || !instanceId) {
      throw new Error('topic or instanceId can\'t be null');
    }
    if (!message) {
      throw new Error('message can\'t be null');
    } else if (typeof message !== 'string') {
      throw new Error('message must be String');
    } else if (typeof tag !== 'string') {
      throw new Error('tag must be String');
    }
    const producer = client.getProducer(instanceId, topic);
    try {
      var res,
        msgProps = new MessageProperties();
      if (propertyKey !== null && propertyValue !== null) {
        // 设置属性
        msgProps.putProperty(propertyKey, propertyValue);
      }
      if (delayTime <= 0) {
        // 设置KEY
        if (messageKey) {
          msgProps.messageKey(messageKey);
        }
        res = await producer.publishMessage(message, tag, msgProps);
      } else {
        // 定时消息, 定时时间为10s后
        msgProps.startDeliverTime(Date.now() + delayTime * 1000);
        res = await producer.publishMessage(message, tag, msgProps);
      }
      if (callback && typeof callback === 'function') {
        callback('Publish message success', res.body.MessageId)
      }
      console.log('Publish message: MessageID:%s,BodyMD5:%s', res.body.MessageId, res.body.MessageBodyMD5);
    } catch (e) {
      // 消息发送失败，需要进行重试处理，可重新发送这条消息或持久化这条数据进行补偿处理
      if (callback && typeof callback === 'function') {
        callback('Publish message failed', e)
      }
      console.log(e)
    }
  }

  /**
   * 消费消息
   * params {
   *    topic: topic name
   *    instanceId: rocketMQ instance id
   *    groupId: group name
   *    tag: tag name, default is empty
   *    success: success callback function
   * }
   */
  mqClient.consumeMessage = async function (params) {
    if (!params) {
      throw new Error('params is null')
    }
    let { topic, instanceId, groupId, tag, success, consumeCount, loopTime } = params;
    tag = tag || '';
    consumeCount = consumeCount || 1;
    if (consumeCount <= 0) {
      consumeCount = 1;
    }
    consumeCount = consumeCount > 16 ? 16 : consumeCount;
    loopTime = loopTime || 10;
    if (loopTime <= 0) {
      loopTime = 10;
    }
    loopTime = loopTime > 30 ? 30 : loopTime;
    if (!topic || !instanceId || !groupId) {
      throw new Error('topic, instanceId, groupId can\'t be null');
    }
    const consumer = client.getConsumer(instanceId, topic, groupId, tag);
    while (true) {
      try {
        // 长轮询消费消息
        // 长轮询表示如果topic没有消息则请求会在服务端挂住3s，3s内如果有消息可以消费则立即返回
        var res = await consumer.consumeMessage(
          consumeCount, // 一次最多消费3条(最多可设置为16条)
          loopTime // 长轮询时间3秒(最多可设置为30秒)
        );
        if (res.code === 200) {
          console.log("Consume Messages, requestId:%s", res.requestId);
          // 消费消息，处理业务逻辑
          const handles = res.body.map((message) => {
            console.log("\tMessageId:%s,Tag:%s,PublishTime:%d,NextConsumeTime:%d,FirstConsumeTime:%d,ConsumedTimes:%d,Body:%s" +
              ",Props:%j,MessageKey:%s,Prop-A:%s",
              message.MessageId, message.MessageTag, message.PublishTime, message.NextConsumeTime, message.FirstConsumeTime, message.ConsumedTimes,
              message.MessageBody,message.Properties,message.MessageKey,message.Properties.a);
            if (typeof success === 'function') {
              success(message);
            }
            return message.ReceiptHandle;
          })
        }
      } catch (e) {
        if (e && e.Code && e.Code.indexOf("MessageNotExist") > -1) {
          // 没有消息，则继续长轮询服务器
          console.log("Consume Message: no new message, RequestId:%s, Code:%s", e.RequestId, e.Code);
        } else {
          console.log(e);
        }
      }
    }
  }

  /**
   * 确认消费消息
   * params {
   *    topic: topic name
   *    instanceId: rocketMQ instance id
   *    groupId: group name
   *    tag: tag name, default is empty
   *    handles: message handles
   *    failed: failed callback function
   * }
   */
  mqClient.ackMessage = async function (params) {
    if (!params) {
      throw new Error('params can\'t be null')
    }
    var topic = params.topic,
      instanceId = params.instanceId,
      groupId = params.groupId,
      tag = params.tag || '',
      handles = params.handles,
      failed = params.failed;
    if (!topic || !instanceId || !groupId) {
      throw new Error('topic, instanceId, groupId can\'t be null');
    }
    const consumer = client.getConsumer(instanceId, topic, groupId, tag);

    if (!Array.isArray(handles) || !handles || handles.length === 0) {
      throw new Error('handles must be Array and has values');
    }
    // message.NextConsumeTime前若不确认消息消费成功，则消息会重复消费
    // 消息句柄有时间戳，同一条消息每次消费拿到的都不一样
    var res = await consumer.ackMessage(handles);
    if (res.code !== 204) {
      // 某些消息的句柄可能超时了会导致确认不成功
      console.log("Ack Message Fail:");
      const failHandles = res.body.map((error) => {
        console.log("\tErrorHandle:%s, Code:%s, Reason:%s\n", error.ReceiptHandle, error.ErrorCode, error.ErrorMessage);
        if (typeof failed === 'function') {
            failed(error)
        }
        return error.ReceiptHandle;
      });
      handles.forEach((handle)=>{
        if (failHandles.indexOf(handle) < 0) {
          console.log("\tSuc Handle:%s\n", handle);
        }
      });
    } else {
      // 消息确认消费成功
      console.log("Ack Message suc, RequestId:%s\n\t", res.requestId, handles.join(','));
    }
  }

  return mqClient;
}

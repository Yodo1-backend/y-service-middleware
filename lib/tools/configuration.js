/**
 * @author XiaChengxing
 * @date 2019/5/8 5:56 PM
 */

const mailConfig = {
    ToBd: 'ToBd',
    ToOps: 'ToOps',
    ToBdAOps: 'ToBdAOps',
    register: 'RegisterReview'
};

const mailContent = {
    user: {
        activate: {
            title: {
                zh: '注册激活',
                en: 'Registration Confirmation'
            },
            content: {
                zh: '<p>您好：</p>\n' +
                '<p>欢迎您注册并使用Yodo1广告业务，点击链接确认你的注册邮箱，该链接有效时间为24小时，链接地址：</p>\n' +
                '<p>{{link}}</p>',
                en: '<p>Hello：</p>\n' +
                '<p>Thank you for choosing Yodo1 Managed Ads services. Please click the link below to confirm your email and activate your account. The link will be valid for 24 hours.</p>\n' +
                '<p>{{link}}</p>'
            }
        },
        welcome: {
            title: {
                zh: '欢迎使用MAS',
                en: 'Welcome to MAS!'
            },
            content: {
                zh: '<p>Hello Developer:</p>\n' +
                '            <p>Thank you for creating a login on the Yodo1 Managed Ad Services (MAS) platform. In order to begin taking advantage of the full set of benefits the platform offers you need to do the following:</p>\n' +
                '            <p>1. Login to mas.yodo1.com</br>\n' +
                '               2. Create an App on the dashboard</br>\n' +
                '               3. Fill in the required information about the App</br>\n' +
                '               4. Download SDK and start integration</br>\n' +
                '               5. The SDK integration is straightforward and takes very little time. If you do happen to run any technical issues or questions, please contact us at mas.bd@yodo1.com</br>\n' +
                '               6. Submit the SDK-integrated build to App Store/Play Store</br>\n' +
                '               7. Once the build with the SDK integrated has gone live on the App Store/Play Store, let us know by click ing the “Release” Button on your <a href="https://mas.yodo1.com/registration/login">App Details page</a>.</p>\n' +
                '            <p>Once you have successfully completed the above steps you will be able to track ad revenues (video, interstitial, banner, launch, etc.) for your Managed Ad Service and/or Pirate Box traffic.</p>\n' +
                '            <p>You will begin to receive bank transfers once your Ad revenues start coming in!</p>\n' +
                '            <p>Regards,</p>',
                en: '<p>Hello Developer:</p>\n' +
                '            <p>Thank you for creating a login on the Yodo1 Managed Ad Services (MAS) platform. In order to begin taking advantage of the full set of benefits the platform offers you need to do the following:</p>\n' +
                '            <p>1. Login to mas.yodo1.com</br>\n' +
                '               2. Create an App on the dashboard</br>\n' +
                '               3. Fill in the required information about the App</br>\n' +
                '               4. Download SDK and start integration</br>\n' +
                '               5. The SDK integration is straightforward and takes very little time. If you do happen to run any technical issues or questions, please contact us at mas.bd@yodo1.com</br>\n' +
                '               6. Submit the SDK-integrated build to App Store/Play Store</br>\n' +
                '               7. Once the build with the SDK integrated has gone live on the App Store/Play Store, let us know by click ing the “Release” Button on your <a href="https://mas.yodo1.com/registration/login">App Details page</a>.</p>\n' +
                '            <p>Once you have successfully completed the above steps you will be able to track ad revenues (video, interstitial, banner, launch, etc.) for your Managed Ad Service and/or Pirate Box traffic.</p>\n' +
                '            <p>You will begin to receive bank transfers once your Ad revenues start coming in!</p>\n' +
                '            <p>Regards,</p>'
            }
        },
        resetPassword: {
            title: {
                zh: '重置密码',
                en: 'Reset Your Password'
            },
            content: {
                zh: '<p>您好：</p>\n' +
                '<p>欢迎您使用Yodo1广告业务，我们收到您的重置密码请求，点击链接重置您的密码，如果您并未申请修改密码，请忽略改邮件，该链接有效时间为24小时，链接地址：</p>\n' +
                '<p>{{link}}</p>',
                en: '<p>Hello：</p>\n' +
                '<p>Thank you for using Yodo1 Managed Ads services. Please click on the link below to reset your password. If your did not request to change your password, please ignore this email. The link will be valid for 24 hours.</p>\n' +
                '<p>{{link}}</p>'
            }
        },
        path: {
            resetPassword: 'registration/password/reset/',
            activate: 'registration/register/confirm/'
        }
    },
    yodo1: {
        register: {
            title: '[通知]新注册',
            content: '<h2>您好：</h2>' +
            '<b>{{user}}注册了Yodo1广告业务开发者平台帐号，请知悉！</b><br/>' +
            '<b>Yodo1广告业务团队</b>'
        },
        gameAdd: {
          title: '[通知]新游戏提交审核',
          content: '<h2>您好：</h2>' +
          '<b>{{user}} 创建了新游戏 {{game}}</b><br/>' +
          '<b>请去管理后台对游戏进行审核</b><br/>' +
          '<b>Yodo1广告业务团队</b>'
        },
        gameUpdate: {
            title: '[通知]游戏更新审核',
            content: '<h2>您好：</h2>' +
            '<b>{{user}}对游戏 {{game}} 进行了修改</b><br/>' +
            '<b>请去管理后台对游戏进行审核</b><br/>' +
            '<b>Yodo1广告业务团队</b>'
        },
        gamePublish: {
            title: '[通知]游戏提交发布',
            content: '<h2>您好：</h2>' +
            '<b>{{user}}准备发布游戏 {{game}} </b><br/>' +
            '<b>应用平台：{{platform}} </b><br/>' +
            '<b>发行区域：{{region}} </b><br/>' +
            '<b>广告类型：{{ad}} </b><br/>' +
            '<b>预估DAU量级：{{dau}} </b><br/>' +
            '<b>请去管理后台对游戏进行审核和配置正式广告</b><br/>' +
            '<b>Yodo1广告业务团队</b>'
        },
        support: {
            title: '联系我们[{{title}}]',
            content: '<h2>邮件人信息：</h2>' +
            '<b>姓名：{{name}}</b><br/>' +
            '<b>邮件：{{mail}}</b><br/>' +
            '<b>电话：{{phone}}</b><br/>' +
            '<b>公司网站：{{web}}</b><br/>' +
            '<b>职位：{{job}}</b><br/>' +
            '<h2>消息内容：</h2>' +
            '<b>{{content}}</b>'
        }
    },
    signature: {
        zh: 'Yodo1广告业务团队',
        en: 'Yodo1 Managed Ads ServiceTeam'
    },
    titlePic: {
        zh: 'https://bj-ali-opp-portal-common-prd.oss-cn-beijing.aliyuncs.com/mail/title_zh.jpg',
        en: 'https://bj-ali-opp-portal-common-prd.oss-cn-beijing.aliyuncs.com/mail/title_en.jpg'
    }
};

const htmlModel = '<html>\n' +
    '<head>\n' +
    '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n' +
    '    <title></title>\n' +
    '    <style>\n' +
    '        a {\n' +
    '            color: #80C3CC;\n' +
    '        }\n' +
    '    </style>\n' +
    '</head>\n' +
    '<body style="padding:0; margin:0" style="font:Arial, Helvetica, sans-serif">\n' +
    '<table width="610" border="0" cellpadding="0" cellspacing="0"\n' +
    '       style="table-layout: fixed; border-collapse:collapse; margin:0 auto; font:Arial, Helvetica, sans-serif">\n' +
    '    <tr>\n' +
    '        <td><img src="{{title_pic}}"/></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '        <td style="padding:28px; line-height: 26px; font:Arial, Helvetica, sans-serif; font-size:14px;">\n' +
    '            {{content}}\n' +
    '    \n' +
    '            <p style="font-size: 18px;">{{sign}}</p>\n' +
    '        </td>\n' +
    '    </tr>\n' +
    '</table>\n' +
    '</body>\n' +
    '</html>';

var middleware = module.exports = {};
middleware.mailConfig = function () {
    return mailConfig;
};

middleware.mailContent = function () {
    return mailContent;
};

middleware.htmlModel = function () {
    return htmlModel;
};
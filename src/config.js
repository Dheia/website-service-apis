
module.exports = {
    path: '/var/www/html/websites/',
    basePath: '/var/www/html/',
     // gitLabUrl: 'http://209.50.53.116',
    // gitLabUrl: 'http://209.50.50.225',
    gitLabUrl:'https://gitlab.com',
    // gitLabUrl: 'fsaiyed',
    gitLabUsername: 'cenacle-devops',
    // mailSendApi: "http://api.flowzcluster.tk/sendmail/email/send",
    mailSendApi: "https://api."+process.env.domainKey+"/sendmail/email/send",
    // gitLabToken: 'eQ1-V9hyB9PN_XYnYfkV'
    gitLabToken: 'UbYWRfyi44mGR_PJr9nh'
}

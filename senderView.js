const docusign = require('docusign-esign')


function createSenderView(accountId, envelopeId) {

    // instantiate a new EnvelopesApi object
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath("https://demo.docusign.net/restapi/");
    dsApiClient.addDefaultHeader('Authorization', 'Bearer XXXXXXXx')
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // set the url where you want the recipient to go once they are done signing
    // should typically be a callback route somewhere in your app
    var viewRequest = new docusign.ReturnUrlRequest();
    viewRequest.returnUrl = 'https://www.docusign.com/';

    // call the CreateRecipientView API
    envelopesApi.createSenderView(accountId, envelopeId, { 'returnUrlRequest': viewRequest }, function (error, senderView, response) {
        if (error) {
            console.log('Error: ' + error);
            return;
        }

        if (senderView) {
            console.log('ViewUrl: ' + JSON.stringify(senderView));
        }
        return JSON.stringify(senderView);
    });
}

console.log(createSenderView("aecbc359-1111-4e81-9823-1a3d08d9a221",
    "e34f51e6-ce47-4425-aa98-a7126919482c"))
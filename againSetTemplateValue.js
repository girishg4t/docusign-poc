const docusign = require('docusign-esign')

function makeEnvelope(args) {
    // create the envelope definition with the template id
    let envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
        templateId: args.templateId, status: 'sent'
    });

    let text = docusign.Text.constructFromObject({
        tabLabel: "nameLabel", value: "Girish Talekar!"
    });
    let textPresAddress = docusign.Text.constructFromObject({
        tabLabel: "presentAddress", value: "Infracloud Pune"
    });

    // We can also add a new tab (field) to the ones already in the template:
    let textExtra = docusign.Text.constructFromObject({
        document_id: "1", page_number: "1",
        font: "helvetica", font_size: "size14", tabLabel: "permAddress",
        height: "23", width: "84", required: "false",
        bold: 'true', value: "At Nara",
        locked: 'false'
    });

    // Pull together the existing and new tabs in a Tabs object:
    let tabs = docusign.Tabs.constructFromObject({
        textTabs: [text, textExtra, textPresAddress]
    });
    // Create the template role elements to connect the signer and cc recipients
    // to the template
    let signer = docusign.TemplateRole.constructFromObject({
        email: args.signerEmail, name: args.signerName,
        roleName: 'signer',
        clientUserId: args.signerClientId, // change the signer to be embedded
        tabs: tabs // Set tab values
    });
    // Create a cc template role.
    let cc = docusign.TemplateRole.constructFromObject({
        email: args.ccEmail, name: args.ccName,
        roleName: 'cc'
    });
    // Add the TemplateRole objects to the envelope object
    envelopeDefinition.templateRoles = [signer, cc];
    return envelopeDefinition;
}
// console.log(JSON.stringify(makeEnvelope({
//     templateId: "ee481324-1906-4634-82f6-50f3ace8e357",
//     signerEmail: "yachikaralhan49@gmail.com",
//     signerName: "Yachika Ralhan",
//     ccEmail: "yachikaralhan49@gmail.com",
//     ccName: "Yachika Ralhan",
//     signerClientId: "yachikaralhan49@gmail.com",
// })))


async function sendEnvelop(args) {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)
    console.log("*****", envelope);

    // Call Envelopes::create API method
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createEnvelope(
        args.accountId, { envelopeDefinition: envelope });

    return results;
}


sendEnvelop({
    accountId: "aecbc359-1111-4e81-9823-1a3d08d9a221",
    accessToken: "XXXXX",
    basePath: "https://demo.docusign.net/restapi/",
    envelopeArgs: {
        templateId: "d883b52c-5b94-41dc-8da5-546fb193e120",
        signerEmail: "yachikaralhan49@gmail.com",
        signerName: "Yachika Ralhan",
        ccEmail: "talekar.g@gmail.com",
        ccName: "Girish Talekar",
        signerClientId: "girishtalekar.g@gmail.com",
    }
}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err)
})
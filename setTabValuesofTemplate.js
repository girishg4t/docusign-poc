const docusign = require('docusign-esign')

function makeEnvelope(args) {
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // args.ccEmail
    // args.ccName
    // args.templateId

    // The envelope has two recipients.
    // recipient 1 - signer
    // recipient 2 - cc
    // This method sets values for many of the template's tabs.
    // It also adds a new tab, and adds a custom metadata field

    // create the envelope definition with the template id
    let envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
        templateId: args.templateId, status: 'sent'
    });


    let text = docusign.Text.constructFromObject({
        tabLabel: "permAddress", value: "Jabberwocky!",
        document_id: "1",
    });

    // We can also add a new tab (field) to the ones already in the template:
    let textExtra = docusign.Text.constructFromObject({
        document_id: "1",
        font: "helvetica", font_size: "size14", tab_label: "nameLabel",
        bold: 'true', value: "GGGGGGGGGG",
        locked: 'false'
    });

    // Pull together the existing and new tabs in a Tabs object:
    let tabs = docusign.Tabs.constructFromObject({
        textTabs: [text, textExtra],
    });
    // Create the template role elements to connect the signer and cc recipients
    // to the template
    let signer = docusign.TemplateRole.constructFromObject({
        email: args.signerEmail, name: args.signerName,
        roleName: 'editor',
        clientUserId: args.signerClientId, // change the signer to be embedded
        tabs: tabs
    });

    // Create a cc template role.
    let cc = docusign.TemplateRole.constructFromObject({
        email: args.ccEmail, name: args.ccName,
        roleName: 'cc'
    });
    // Add the TemplateRole objects to the envelope object
    envelopeDefinition.templateRoles = [signer, cc];
    // Create an envelope custom field to save the our application's
    // data about the envelope
    let customField = docusign.TextCustomField.constructFromObject({
        name: 'app metadata item',
        required: 'false',
        show: 'true', // Yes, include in the CoC
        value: '1234567'
    })
        , customFields = docusign.CustomFields.constructFromObject({
            textCustomFields: [customField]
        });
    envelopeDefinition.customFields = customFields;
    return envelopeDefinition;
}

// console.log(makeEnvelope({
//     templateId: "d883b52c-5b94-41dc-8da5-546fb193e120",
//     signerEmail: "yachikaralhan49@gmail.com",
//     signerName: "Yachika Ralhan",
//     ccEmail: "talekar.g@gmail.com",
//     ccName: "Girish Talekar",
//     signerClientId: "girishtalekar.g@gmail.com",
// }))

async function sendEnvelop(args) {
    let envelopeArgs = args.envelopeArgs
        , envelopeDefinition = makeEnvelope(envelopeArgs);
    // 2. Create the envelope
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
        , results = await envelopesApi.createEnvelope(
            args.accountId, { envelopeDefinition: envelopeDefinition })
        , envelopeId = results.envelopeId;

    // 3. create the recipient view, the embedded signing
    let viewRequest = docusign.RecipientViewRequest.constructFromObject({
        returnUrl: 'https://www.docusign.com/',
        authenticationMethod: 'none',
        email: envelopeArgs.signerEmail,
        userName: envelopeArgs.signerName,
        clientUserId: envelopeArgs.signerClientId
    });

    // 4. Call the CreateRecipientView API
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createRecipientView(args.accountId, envelopeId,
        { recipientViewRequest: viewRequest });

    return ({ envelopeId: envelopeId, redirectUrl: results.url })
}


sendEnvelop({
    accountId: "aecbc359-1111-4e81-9823-1a3d08d9a221",
    accessToken: "XXXXX",
    basePath: "https://demo.docusign.net/restapi/",
    envelopeArgs: {
        templateId: "d883b52c-5b94-41dc-8da5-546fb193e120",
        signerEmail: "yachikaralhan49@gmail.com",
        signerName: "Yachika Ralhan",
        ccEmail: "yachikaralhan49@gmail.com",
        ccName: "Yachika Ralhan",
        signerClientId: "yachikaralhan49@gmail.com",
    }
}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err)
})
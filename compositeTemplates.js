const docusign = require('docusign-esign');

function makeEnvelope(args) {
    let signer1 = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        roleName: "editor",
        recipientId: "1",
        // Adding clientUserId transforms the template recipient
        // into an embedded recipient:
        clientUserId: args.signerClientId
    });
    // Create the cc recipient
    let cc1 = docusign.CarbonCopy.constructFromObject({
        email: args.ccEmail,
        name: args.ccName,
        roleName: "cc",
        recipientId: "2"
    });
    // Recipients object:
    let recipientsServerTemplate = docusign.Signer.constructFromObject({
        carbonCopies: [cc1], signers: [signer1],
    });

    // create a composite template for the Server Template
    let compTemplate1 = docusign.CompositeTemplate.constructFromObject({
        compositeTemplateId: "1",
        serverTemplates: [
            docusign.ServerTemplate.constructFromObject({
                sequence: "1",
                templateId: args.templateId
            })
        ],
        // Add the roles via an inlineTemplate
        inlineTemplates: [
            docusign.InlineTemplate.constructFromObject({
                sequence: "1",
                recipients: recipientsServerTemplate
            })
        ]
    })

    // The signer recipient for the added document with
    // a tab definition:
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: '**signature_1**',
        anchorYOffset: '10', anchorUnits: 'pixels',
        anchorXOffset: '20'
    });
    // Create the legal and familiar text fields.
    // Recipients can update these values if they wish to.
    const textname = docusign.Text.constructFromObject({
        font: 'helvetica', fontSize: 'size11',
        bold: 'true', value: "GGGGGGGGG",
        locked: 'false',
        tabLabel: 'nameLabel'
    })
    const textPermAddress = docusign.Text.constructFromObject({
        font: 'helvetica', fontSize: 'size11',
        bold: 'true', value: "At Nara",
        locked: 'false',
        tabLabel: 'permAddress'
    })
    let signer1Tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere1],
        textTabs: [textname, textPermAddress]
    });

    // Signer definition for the added document
    let signer1AddedDoc = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        clientId: args.signerClientId,
        roleName: "signer",
        recipientId: "1",
        tabs: signer1Tabs
    });



    // Recipients object for the added document:
    let recipientsAddedDoc = docusign.Recipients.constructFromObject({
        carbonCopies: [cc1], signers: [signer1AddedDoc]
    });
    // create the HTML document
    let doc1 = new docusign.Document()
        , doc1b64 = Buffer.from(document1(args)).toString('base64');
    doc1.documentBase64 = doc1b64;
    doc1.name = 'Appendix 1--Sales order'; // can be different from actual file name
    doc1.fileExtension = 'html';
    doc1.documentId = '1';

    // create a composite template for the added document
    let compTemplate2 = docusign.CompositeTemplate.constructFromObject({
        compositeTemplateId: "2",
        // Add the recipients via an inlineTemplate
        inlineTemplates: [
            docusign.InlineTemplate.constructFromObject({
                sequence: "2",
                recipients: recipientsAddedDoc
            })
        ],
        document: doc1
    })

    // create the envelope definition
    let env = docusign.EnvelopeDefinition.constructFromObject({
        status: "sent",
        compositeTemplates: [compTemplate1, compTemplate2]
    })

    return env;
}

function document1(args) {

    return `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${args.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.ccName}, ${args.ccEmail}</p>
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${args.item}</b>, quantity: <b>${args.quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `
}

async function createEnvelop(args) {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)

    // Call Envelopes::create API method
    // Exceptions will be caught by the calling function
    let results = await envelopesApi.createEnvelope(
        args.accountId, { envelopeDefinition: envelope });

    let envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId ${envelopeId}`)
}

createEnvelop({
    accountId: "aecbc359-1111-4e81-9823-1a3d08d9a221",
    accessToken: "XXXXX",
    basePath: "https://demo.docusign.net/restapi/",
    envelopeArgs: {
        templateId: "232874d6-0dad-45b4-a22d-9e2f90d367e4",
        signerEmail: "yachikaralhan49@gmail.com",
        signerName: "Yachika Ralhan",
        ccEmail: "yachikaralhan49@gmail.com",
        ccName: "Yachika Ralhan",
        signerClientId: "girishtalekar.g@gmail.com",
    }
}).then((result) => {
    console.log(result)
}).catch((err) => {
    console.log(err)
})
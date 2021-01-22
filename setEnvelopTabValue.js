const docusign = require('docusign-esign')

function makeEnvelope(args) {
    // Create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.templateId = args.templateId;
    let salary = 124000;
    let signer1 = docusign.TemplateRole.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        roleName: 'signer'
    });


    // Create signHere field (also known as tabs) on the document,
    const signHere = docusign.SignHere.constructFromObject({
        anchorString: '/sn1/', anchorUnits: 'pixels',
        anchorYOffset: '10', anchorXOffset: '20'
    })
    // Create the legal and familiar text fields.
    // Recipients can update these values if they wish to.
    const textLegal = docusign.Text.constructFromObject({
        anchorString: '/legal/', anchorUnits: 'pixels',
        anchorYOffset: '-9', anchorXOffset: '5',
        font: 'helvetica', fontSize: 'size11',
        bold: 'true', value: "GGGGGGGGG",
        locked: 'false', tabId: 'legal_name',
        tabLabel: 'Legal name'
    })
    const textFamiliar = docusign.Text.constructFromObject({
        anchorString: '/familiar/', anchorUnits: 'pixels',
        anchorYOffset: '-9', anchorXOffset: '5',
        font: 'helvetica', fontSize: 'size11',
        bold: 'true', value: args.signerName,
        locked: 'false', tabId: 'familiar_name',
        tabLabel: 'Familiar name'
    })
    // Create the salary field. It should be human readable, so
    // add a comma before the thousands number, a currency indicator, etc.
    const usFormat = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
    const salaryReadable = usFormat.format(salary)
    const textSalary = docusign.Text.constructFromObject({
        anchorString: '/salary/', anchorUnits: 'pixels',
        anchorYOffset: '-9', anchorXOffset: '5',
        font: 'helvetica', fontSize: 'size11',
        bold: 'true', value: salaryReadable,
        locked: 'true', // mark the field as readonly
        tabId: 'salary', tabLabel: 'Salary'
    });

    // Add the tabs model (including the sign_here tab) to the signer.
    // The Tabs object wants arrays of the different field/tab types
    signer1.tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere],
        textTabs: [textLegal, textFamiliar, textSalary]
    });


    salaryCustomField = docusign.TextCustomField.constructFromObject({
        name: 'salary',
        required: 'false',
        show: 'true', // Yes, include in the CoC
        value: salary
    });
    customFields = docusign.CustomFields.constructFromObject({
        textCustomFields: [salaryCustomField]
    });

    // Create a cc template role.
    // We're setting the parameters via setters
    let cc1 = new docusign.TemplateRole();
    cc1.email = args.ccEmail;
    cc1.name = args.ccName;
    cc1.roleName = 'cc';

    // Add the TemplateRole objects to the envelope object
    env.templateRoles = [signer1, cc1];
    env.status = "sent"; // We want the envelope to be sent  
    env.customFields = customFields;
    return env;
}

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
        templateId: "00d2d6cf-37bf-4253-af37-5898a7ce6ab0",
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
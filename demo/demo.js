import {
  Authorize,
  CodeValidator,
  Decrypt,
  Encrypt,
  EncryptionAlgorithm,
  ServerResponse,
  XQSDK,
} from "@xqmsg/jssdk-core";

import {
  getProperty,
  removeAllProperties,
  removeProperty,
  replaceProperty,
  setProperty,
} from "../commons/index.js";

const xqsdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});

$(
  "#sender-access-request-button, #validate-access-request-button, #recipient-list-button, #recipient-access-request-button, #encrypt-button, #decrypt-button, #refresh-button"
).on("click", function (clickEvent) {
  switch (clickEvent.currentTarget.id) {
    case "sender-access-request-button": {
      //initally clear out old stores
      removeAllProperties();

      let user = $("#user-input").val();
      setProperty("user", user);
      new Authorize(xqsdk)
        .supplyAsync({ [Authorize.USER]: user, [Authorize.CODE_TYPE]: "pin" })
        .then(function (response) {
          switch (response.status) {
            case ServerResponse.OK: {
              setProperty("next", "encryptScreen");
              buildValidationScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(response);
              break;
            }
          }
        });
      break;
    }
    case "validate-access-request-button": {
      new CodeValidator(xqsdk)
        .supplyAsync({ [CodeValidator.PIN]: $("#pin-input").val() })
        .then(function (validationResponse) {
          switch (validationResponse.status) {
            case ServerResponse.OK: {
              if (getProperty("next") === "encryptScreen") {
                buildEncryptScreen();
              } else {
                $("#decrypt-button").trigger("click", [$("#user-input").val()]);
              }
              break;
            }
            case ServerResponse.ERROR: {
              console.info(validationResponse);
              removeProperty("tempToken");
              break;
            }
          }
        });
      break;
    }
    case "encrypt-button": {
      const recipientsInput = $("#recipient-list-input")
        .val()
        .split(/,|\s+/g)
        .filter(function (el) {
          return el !== "" && el != null;
        });
      const text = $("#encrypt-input").val();
      const expiresHours = 1;
      const algorithm = $("#algorithmSelectBox").val();
      if (!["OTPV2", "AES"].includes(algorithm)) {
        console.error(
          "Invalid algorithm selection : " +
            algorithm +
            "! Select one of [OTPV2, AES]"
        );
        break;
      }
      setProperty("algorithm", algorithm);
      let payload = {
        [Encrypt.TEXT]: text,
        [Encrypt.RECIPIENTS]: recipientsInput,
        [Encrypt.EXPIRES_HOURS]: expiresHours,
      };

      new Encrypt(xqsdk, xqsdk.getAlgorithm(algorithm))
        .supplyAsync(payload)
        .then(function (encryptResponse) {
          switch (encryptResponse.status) {
            case ServerResponse.OK: {
              const data = encryptResponse.payload;

              const locatorKey = data[Encrypt.LOCATOR_KEY];
              const encryptedText = data[Encrypt.ENCRYPTED_TEXT];

              setProperty(Encrypt.LOCATOR_KEY, locatorKey);
              setProperty(Encrypt.ENCRYPTED_TEXT, encryptedText);

              buildIdentifyScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(encryptResponse);
              break;
            }
          }
        });
      break;
    }
    case "recipient-access-request-button": {
      let recipient = $("#recipient-input").val();
      setProperty("user", recipient);
      new Authorize(xqsdk)
        .supplyAsync({ [Authorize.USER]: recipient })
        .then(function (response) {
          switch (response.status) {
            case ServerResponse.OK: {
              replaceProperty("next", "enryptScreen", "decryptScreen");
              buildValidationScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(response);
              break;
            }
          }
        });
      break;
    }
    case "decrypt-button": {
      const locatorKey = getProperty(Encrypt.LOCATOR_KEY);
      const encryptedText = getProperty(Encrypt.ENCRYPTED_TEXT);
      new Decrypt(xqsdk, xqsdk.getAlgorithm(getProperty("algorithm")))
        .supplyAsync({
          [Decrypt.LOCATOR_KEY]: locatorKey,
          [Decrypt.ENCRYPTED_TEXT]: encryptedText,
        })
        .then(function (decryptResponse) {
          switch (decryptResponse.status) {
            case ServerResponse.OK: {
              const data = decryptResponse.payload;
              const decryptedText = data[EncryptionAlgorithm.DECRYPTED_TEXT];
              setProperty("decryptedText", decryptedText);
              buildDecryptScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(decryptResponse);
              break;
            }
          }
        });
      break;
    }
    case "refresh-button": {
      removeAllProperties();
      location.reload();
      break;
    }
  }
});

function buildValidationScreen() {
  $("div[id='label-content']").css("visibility", "visible");

  $("label[for='label-content']")
    .empty()
    .html(
      "Please check your email or phone for the two-factor confirmation pin sent to either the email or phone number you input in the previous step. " +
        "We will utilize the <a href='https://github.com/xqmsg/jssdk-core' target='_blank'><b>Code Validation API</b></a> endpoint to validate the code and finally authorize the user via email or phone. <br> <br>" +
        "Enter it below and then press 'Confirm'.<br />"
    )
    .css("visibility", "visible");

  $("button[id='sender-access-request-button']").hide();
  $("input[id='user-input']").hide();

  $("button[id='recipient-access-request-button']").hide();
  $("input[id='recipient-input']").hide();

  $("button[id='validate-access-request-button']").show();
  $("input[id='pin-input']")
    .val("")
    .attr("placeholder", "Enter Your 6 digit Pin Here:")
    .focus()
    .show();

  $("#user-input").val("");
}

function buildEncryptScreen() {
  $("div[id='label-content']").css("visibility", "visible");

  $("div[id='algorithms']").show();

  $("label[for='label-content']")
    .empty()
    .html(
      "Great! You've authorized a subscriber using the <a href='https://github.com/xqmsg/jssdk-core#authorization' target='_blank'><b>Authorize API</b></a> endpoint and validated them using the <a href='https://github.com/xqmsg/jssdk-core#code-validation' target='_blank'><b>Code Validation API</b></a> endpoint. <br> <br>" +
        "Next we will create an encrypted message using the <a href='https://github.com/xqmsg/jssdk-core#encrypt' target='_blank'><b>Encrypt API</b></a> endpoint. First we'll select a preferred encryption method, <a href='https://en.wikipedia.org/wiki/Advanced_Encryption_Standard' target='_blank'><b>AES (Advanced Encryption Standard)</b></a> or <a href='https://en.wikipedia.org/wiki/One-time_pad' target='_blank'><b>OTPV2 (One-time pad)</b></a>, enter our message to encrypt and add recipients that will be authorized to decrypt and read your message. To add multiple recipients, simply add a comma after each recipient's email like so: <br> <br>" +
        "Example: <b>example@email.com, example2@email.com</b> <br> <br>"
    );

  $("button[id='validate-access-request-button']").hide();
  $("input[id='pin-input']").hide();

  $("input[id='recipient-list-input']")
    .attr("placeholder", "Enter at least one recipient email here:")
    .focus()
    .show();

  $("div[id='recipient-list-div']").show();

  $("button[id='encrypt-button']").show();
  $("input[id='encrypt-input']")
    .attr("placeholder", "Enter a message here:")
    .focus()
    .show();
}

function buildIdentifyScreen() {
  $("div[id='label-content']").css("visibility", "visible");

  $("div[id='algorithms']").hide();

  $("input[id='encrypt-input']").hide();

  $("div[id='recipient-list-div']").hide();

  $("input[id='recipient-list-input']").hide();

  $("button[id='encrypt-button']").hide();

  $("label[for='label-content']")
    .empty()
    .html(
      "In the previous step, we created an encryped message using your preferred encryption algorithm and specified a list of authorized recipients allowed to decrypt and read your message." +
        "Your recipient would receive an encrpyted message like so: <br> <br>" +
        `<p style="font-family: ProximaNova, sans-serif; font-size: 24px;font-weight: 500;font-variant: normal;;">You have received an encrypted message:</p> ` +
        `<p style="font-family: ProximaNova, sans-serif; font-size: 24px;font-weight: 500;font-variant: normal;color: dodgerblue;">${getProperty(
          Encrypt.ENCRYPTED_TEXT
        )}</p> <br> <br>` +
        "We will utilize the <a href='https://github.com/xqmsg/jssdk-core#authorization' target='_blank'><b>Authorize API</b></a> endpoint to request access for the email address entered by the 'recipient' below."
    );

  $("button[id='recipient-access-request-button']").show();

  $("input[id='recipient-input']")
    .attr("placeholder", "Enter Your Recipient Email")
    .empty()
    .focus()
    .show();
}

function buildDecryptScreen() {
  $("#encrypt-input").val("");

  $(
    "#sender-access-request-button, #validate-access-request-button, #recipient-list-button, #recipient-access-request-button, #encrypt-button, #decrypt-button"
  ).hide();
  $(
    "#user-input, #pin-input, #recipient-list-input, #recipient-input, #encrypt-input, #decrypt-input"
  ).hide();

  $("div[id='label-content']").css("visibility", "visible");

  $("label[for='label-content']")
    .empty()
    .html(
      "Bravo! We have utilized the <a href='https://github.com/xqmsg/jssdk-core#decrypt' target='_blank'><b>Decrypt API</b></a> endpoint to decrypt the message sent to your authorized recipient.<br />" +
        "The decrypted message reads as follows: <br>" +
        `<p style="font-family: ProximaNova, sans-serif; font-size: 24px;font-weight: 500;font-variant: normal;color: dodgerblue;">${getProperty(
          "decryptedText"
        )}</p> <br>` +
        "This quick demo has shown an end-to-end message flow that: " +
        `<ul>
      <li>Specified and authorized a subscriber via email or phone</li>
      <li>Created an encrypted message using a selected encryption algorithm and list of authorized recipients allowed to decrypt and read the message</li>
      <li>Decrypt the message as an authorized recipient</li>
      </ul>`
    );

  $("button[id='refresh-button']").show();
}

window.addEventListener(
  "load",
  function initScreen() {
    $("label[for='label-content']")
      .empty()
      .html(
        "Welcome! This is a brief demonstration of the XQ Message Javascript SDK.<br />" +
          "We will utilize the SDK to interact seamlessly with the XQ Platform API to authorize and validate users, then encrypt and decrypt a message as an authorized user. <br /> <br />" +
          "We will first utilize the <a href='https://github.com/xqmsg/jssdk-core#authorization' target='_blank'><b>Authorize API</b></a> endpoint to create a subscriber. The subscriber is an email address or phone number that is authorized to use a generated encryption key. " +
          "Please enter your email address below and we'll send a confirmation code.<br />" +
          "We'll guide you through the next steps here. <br />"
      );

    $("div[id='label-content']").css("visibility", "visible");

    var selections = {
      default: "Select Encyption Algorithm:",
      OTPV2: "OTPV2",
      AES: "AES",
    };
    var selectBox = $("#algorithmSelectBox");
    $.each(selections, function (val, text) {
      selectBox.append(
        $(
          '<option style="font-family: ProximaNova, sans-serif; font-size: 24px;font-weight: 500;font-variant: normal;color: dodgerblue;"></option>'
        )
          .val(val)
          .html(text)
      );
    });
    $('#algorithmSelectBox option[value="default"]').attr("selected", true);

    $("input[id='user-input']")
      .attr("placeholder", "Enter Your Email Here:")
      .focus();
  },
  false
);

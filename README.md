## XQ Javascript SDK Example

This project is intended to give the user a high-level overview of the encryption and decryption flow, as well as some sample implementations of core components. In order to run these applications you will need to generate XQ Message [API keys](#api-keys) and input them in both the `demo.js` and `TestLauncher.js` files.

To run the sample applications, simply run:

**Demo**
To run the Demo application, first input your API keys in the `XQSDK` configuration in [demo.js](#./demo/demo.js) then run:

```sh
yarn dev
```

**Tests**
To run the Tests application, first input your API keys in the `XQSDK` configuration in [TestLauncher.js](#./tests/TestLauncher.js) then run:

```sh
yarn dev-test
```

Initially the user will need to register with the XQ Framework. To do so, they click the **Register** button which prompts them for their email. A PIN code will be sent to that email.

When the PIN is then entered into the input field and **Confirm** is pressed, the registration is concluded. At this point the user is fully authenticated with XQ.

Note that an access token will be stored in the local browser cache. This token is used to automatically authenticate the user with XQ for most interactions. The **Clear Credentials** can be pressed at any time to reauthenticate.

The test suite has the following tests:

- Test Get XQ Authorization Token From Active Profile
- Test Dashboard Login
- Test Get Dashboard Applications
- Test Add Dashboard Group
- Test Update Dashboard Group
- Test Remove Dashboard Group
- Test Add Dashboard Contact
- Test Disable Dashboard Contact
- Test Remove Dashboard Contact
- Test Get User Info
- Test Get User Settings
- Test Update User Settings
- Test Create Delegate Access Token
- Test OTP V2 Algorithm
- Test AES Algorithm
- Test Encrypt And Decrypt Text Using OTP V2
- Test Encrypt And Decrypt Text Using AES
- Test File Encrypt And File Decrypt Text Using OTP V2
- Test Combine Authorizations
- Test Delete Authorization
- Test Delete User
- Test Authorize Alias
- Test Check API Key
- Test Key Manipulations

---

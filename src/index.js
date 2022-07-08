const api = require('./api/api')

function sendCode(phone) {
    return api.call('auth.sendCode', {
        phone_number: phone,
        settings: {
            _: 'codeSettings',
        },
    });
}

function signIn({ code, phone, phone_code_hash }) {
    return api.call('auth.signIn', {
        phone_code: code,
        phone_number: phone,
        phone_code_hash: phone_code_hash,
    });
}

function signUp({ phone, phone_code_hash }) {
    return api.call('auth.signUp', {
        phone_number: phone,
        phone_code_hash: phone_code_hash,
        first_name: 'MTProto',
        last_name: 'Core',
    });
}

(async () => {
    const phone = 'PHONE NUMBER';
    const code = 'CODE FROM TELEGRAM AFTER SEND CODE METHOD';

    // const { phone_code_hash } = await sendCode(phone);

    try {
        // const signInResult = await signIn({
        //     code,
        //     phone,
        //     phone_code_hash,
        // });
        // console.log(signInResult)

        const instance = api.getInstance();
        instance.updates.on('updateUserTyping', (test) => {
            console.log(test);
        });

        // if (signInResult._ === 'auth.authorizationSignUpRequired') {
        //     await signUp({
        //         phone,
        //         phone_code_hash,
        //     });
        // }
    } catch (error) {
        console.log(error)
        if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
            console.log(`error:`, error);
        }
    }
})();

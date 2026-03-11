
'use server';
import { signup } from './src/app/actions.js';

async function createTempUser() {
    const formData = new FormData();
    formData.append('email', 'tempuser-test-12345@test.com');
    formData.append('password', 'password123');
    formData.append('confirmPassword', 'password123');
    const result = await signup(null, formData);
    console.log(result);
}

createTempUser();

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {userOne, userOneId, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase);

test("Sign up a new user", async () => {
	const response = await request(app).post("/users").send({
        name: "Asif",
        email: "asif@gmail.com",
        password: "myapp!test123"
    }).expect(201);

    // Assert the db was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assert response
    expect(response.body).toMatchObject({
        user: {
            name: "Asif",
            email: "asif@gmail.com",
        },
        token: user.tokens[0].token
    });

    // Asser user pw
    expect(user.password).not.toBe('myapp!test123')
});

test('Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);

    expect(response.body.token).toBe(user.tokens[1].token)
});

test('Login with bad password', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'incorrectpass1234'
    }).expect(400);
});

test('Get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete user successfully', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Unauthenticated user attempting delete', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/test_img.jpg')
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Update user', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'UpdatedName'
        })
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toBe('UpdatedName');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Dhaka'
        })
        .expect(400)

});


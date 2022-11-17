const request =  require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, userOneToken, setupDatabase} = require('./fixtures/db')


beforeEach( async () => {

    await setupDatabase()

} )


test("Should create user", async () => {

    let response = await request(app).post('/users').send({
        email: 'chidori@konohamail.com',
        name: 'Kakashi Hatake',
        password: 'ichaicha'
    })

    expect(response.status).toBe(201)

    let user = await User.findById(response.body.user._id).exec()

    expect(user).not.toBeNull()

    expect(user).toMatchObject({
        email: 'chidori@konohamail.com',
        name: 'Kakashi Hatake'
    })
})


test("Should login existing user", async () => {

    let response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    })

    expect(response.status).toBe(200)

    const resPayloadBinary = Buffer.from(response.body.token.match(/^.+\.(.+)\..+$/)[1],'base64')

    const resPayload = JSON.parse(resPayloadBinary.toString('utf8'))

    let user = await User.findById(userOne._id).exec()

    expect(user).not.toBeNull()

    expect(user.activeSessions).toContain(resPayload.sessionId)    

})


test("Should not login non-existent user", async () => {

    let response = await request(app).post('/users/login').send({
        email: "fakeid@fakemail.com",
        password: "fakepassword"
    })

    expect(response.status).toBe(400)
    
})


test("Should get profile for authenticated user", async () => {

    let response = await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOneToken}`)

    expect(response.status).toBe(200)

})


test("Should not get profile for authenticated user", async () => {

    let response = await request(app)
        .get('/users/me')

    expect(response.status).toBe(401)

})


test("Should delete account for authenticated user", async () => {

    let response = await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOneToken}`)

    expect(response.status).toBe(200)    

    let user = await User.findById(userOne._id).exec()    

    expect(user).toBeNull()
})


test("Should not delete account for unauthenticated user", async () => {

    let response = await request(app)
        .delete('/users/me')

    expect(response.status).toBe(401)    

})


test("Should upload avatar image", async () => {

    let response = await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOneToken}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')

    expect(response.status).toBe(200)

    let user = await User.findById(userOneId)

    expect(user.avatar).toEqual(expect.any(Buffer))

})


test("Should update valid user fields", async () => {

    let response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            name: 'John Doe'
        })

    expect(response.status).toBe(200)

    let user = await User.findById(userOneId)

    expect(user.name).toBe('John Doe')
})


test("Should not update invalid user fields", async () => {

    let response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            location: 'mars'
        })

    expect(response.status).toBe(400)
})


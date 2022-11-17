const request =  require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
    userOneId, 
    userOneToken, 
    userTwoToken, 
    userOneTaskOne, 
    setupDatabase} = require('./fixtures/db')


beforeEach( async () => {

    await setupDatabase()

} )


test("Should create a task for authenticated user", async () => {

    let response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            description: 'dummy task'
        })

    expect(response.status).toBe(201)

    let task = await Task.findById(response.body._id).exec()

    expect(task).not.toBeNull()

    expect(task).toMatchObject({
        description: 'dummy task',
        owner: userOneId,
        completed: false
    })

})



test("Should not create a task for unauthenticated user", async () => {

    let response = await request(app)
        .post('/tasks')
        .send({
            description: 'dummy task'
        })

    expect(response.status).toBe(401)

})


test("Should fetch tasks for user one", async () => {

    let response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOneToken}`)

    expect(response.status).toBe(200)

    expect(response.body.length).toBe(2)

})


test("Should not be able to delete user one's task using user two's id", async () => {

    let response = await request(app)
        .delete(`/tasks/${userOneTaskOne._id}`)
        .set('Authorization', `Bearer ${userTwoToken}`)

    expect(response.status).toBe(404)

    let task = await Task.findById(userOneTaskOne._id).exec()

    expect(task).not.toBeNull()

})


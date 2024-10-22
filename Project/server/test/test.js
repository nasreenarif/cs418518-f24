import { expect } from "chai";
import supertest from "supertest";
import app from "../app.js";

describe('Addition Testing', ()=>{

it('Should Add two numbers',function(){
    var num1=2;
    var num2=5;
    expect(num1+num2).equal(7)
})

it('Should Add 3 numbers',function(){
    var num1=2;
    var num2=5;
    var num3=1;
    expect(num1+num2+num3).equal(8)
})

})


describe('Testing Login API', ()=>{

    it('Testing POsitive Case of Login API',async function(){
       
        var response= await supertest(app).post(`/user/login`).send({
             email: "nasreenarif95@gmail.com",
             password: "12345678"
        })

        expect(response.status).equal(200)
    })
    })



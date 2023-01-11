import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

//Refatorar para o uso do bloco try/catch
// Validação do resultado:
// Caso nenhuma account seja encontrada na pesquisa por id, retornar um erro 404.
// Mensagem de erro: “Conta não encontrada. Verifique a "id".”

app.get("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const result = accounts.find((account) => account.id === id)

        if (!result) {
            res.status(404)
            throw new Error("Conta não encontrada. Verifique a 'id'.")
        }
        res.status(200).send(result)

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }
})

//Refatorar para o uso do bloco try/catch
// Validação de input:
// Caso a id recebida não inicie com a letra ‘a’ será retornado um erro 400
// Mensagem de erro: “‘id’ inválido. Deve iniciar com letra ‘a’”

app.delete("/accounts/:id", (req: Request, res: Response) => {

    try {
        const id = req.params.id
        if (id[0] !== "a") {
            throw new Error("'id' inválido. Deve iniciar com letra 'a'");
        }
        const accountIndex = accounts.findIndex((account) => account.id === id)

        if (accountIndex >= 0) {
            accounts.splice(accountIndex, 1)
            res.status(200).send("Conta excluída com sucesso")
        } else {
            res.status(404).send("Conta não encontrada. Verifique os dados e tente novamente.")
        }

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }
})

//Refatorar para o uso do bloco try/catch

app.put("/accounts/:id", (req: Request, res: Response) => {

    try {
        const id = req.params.id

        const newId = req.body.id
        const newOwnerName = req.body.ownerName
        const newBalance = req.body.balance
        const newType = req.body.type

        // req.body.id (newId)
        // string que inicia com a letra ‘a’
        if(newId !== undefined){
            if (newId[0] !== "a") {
                res.status(400)
                throw new Error("'id' inválido. Deve iniciar com letra 'a'");
            } 
        }
        
        // req.body.ownerName (newOwnerName)
        // string com no mínimo 2 caracteres
        if (newOwnerName !== undefined) {
            if(typeof newOwnerName !== 'string'){
                throw new Error("'ownerName' deve ser uma string")
            }
            if(newOwnerName.length<2){
                throw new Error("'ownerName' deve ser possuir no mínimo 2 caracteres");
            }
        }

        // req.body.balance (newBalance)
        // Deve ser number
        // Deve ser maior ou igual a zero
        if(newBalance !== undefined){
            if (typeof newBalance !== "number") {
                res.status(400)
                throw new Error("'balance' deve ser do tipo number")
            }
            if (newBalance < 0) {
                res.status(400)
                throw new Error("'balance' deve ser maior ou igual a zero")
            }
        }
        
        // req.body.type (newType)
        // deve valer um dos tipos de conta do enum
        if (newType !== undefined) {
            if (
                newType !== ACCOUNT_TYPE.GOLD &&
                newType !== ACCOUNT_TYPE.BLACK &&
                newType !== ACCOUNT_TYPE.PLATINUM
            ) {
                res.status(400)
                throw new Error("'type' deve ser um tipo válido: Ouro, Platina ou Black");
            }
        }

        const account = accounts.find((account) => account.id === id)

        if (account) {
            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type

            account.balance = isNaN(newBalance) ? account.balance : newBalance
        }

        res.status(200).send("Atualização realizada com sucesso")

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }

})
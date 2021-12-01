let express = require('express');
let router = express.Router();
let AuthorSchema = require('../models/authors');

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

router.get('/', (request, response, next) =>{
    let name = request.query['name']; //Just here for potential future versions - search by name
    if(name) {
        AuthorSchema
            .find({"name": name})
            .exec( (error, author) =>{
                if(error) {
                    response.send({"error": error});
                }
                else {
                    response.send(author);
                }
            });
    }
    else {
        AuthorSchema
            .find()
            .exec( (error, author) =>{
                if(error) {
                    response.send({"error": error});
                }
                else {
                    response.send(author);
                }
            });
    }
});

router.get('/:id', (request, response, next) =>{
    AuthorSchema
        .findById(request.params.id, (error, result) => {
            if(error){
                response.status(500).send(error);
            }
            else if(result){
                response.send(result);
            }
            else {
                response.status(404).send({"id": request.params.id, "error": "Not Found"});
            }
        });
});

router.post('/', (request, response, next) => {
    let authorJSON = request.body;
    if(!authorJSON.name){
        HandleError(response, 'Missing Information', 'Form Data Missing', 500);
    }
    else {
        let author = new AuthorSchema({
            name: authorJSON.name,
            nationality: authorJSON.nationality || "None Listed"
        });
        author.save( (error) => {
            if(error) {
                response.send({"error": error});
            }
            else {
                response.send({"id": author.id});
            }
        });
    }
});

router.patch('/:id', (request, response, next) => {
    AuthorSchema
        .findById(request.params.id, (error, result) => {
            if (error) {
                response.status(500).send(error);
            }
            else if(result) {
                if(request.body._id) {
                    delete request.body._id;
                }
                 for(let field in request.body){
                     result[field] = request.body[field];
                 }
                result.save((error, author) => {
                    if(error) {
                        response.status(500).send(error);
                    }
                    response.send(author);
                });
            }
            else {
                response.status(404).send({"id": request.params.id, "error": "Not Found"});
            }
        });
});

router.delete('/:id', (request, response, next) => {
    AuthorSchema
        .findById(request.params.id, (error, result) => {
            if (error) {
                response.status(500).send(error);
            }
            else if(result) {
                result.remove((error) => {
                    if(error){
                        response.status(500).send(error);
                    }
                    response.send({"deletedId": request.params.id});
                });
            }
            else {
                response.status(404).send({"id": request.params.id, "error": "Not Found"});
            }
        });
});

module.exports = router;
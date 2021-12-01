let express = require('express');
let router = express.Router();
let BookSchema = require('../models/books');
let AuthorSchema = require('../models/authors');

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

router.get('/', (request, response, next) =>{
    let title = request.query['title'];
    if(title) {
        BookSchema
            .find({"title": {"$regex": title, "$options": "i"}}) //Searches case insensitive by partial string
            .exec( (error, books) =>{
                if(error) {
                    response.send({"error": error});
                }
                else {
                    response.send(books);
                }
            });
    }
    else {
        BookSchema
            .find()
            .exec( (error, books) =>{
                if(error) {
                    response.send({"error": error});
                }
                else {
                    response.send(books);
                }
            });
    }
});

router.get('/:id', (request, response, next) =>{
    BookSchema
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
    let bookJSON = request.body;
    if(!bookJSON.title || !bookJSON.author){
        HandleError(response, 'Missing Information', 'Form Data Missing', 500);
    }
    else {
        let book = new BookSchema({
            title: bookJSON.title,
            description: bookJSON.description || 'None',
            year: bookJSON.year || 2021,
            author: bookJSON.author,
            hardCover: bookJSON.hardCover,
            price: bookJSON.price || 0
        });
        book.save( (error) => {
            if(error) {
                response.send({"error": error});
            }
            else {
                response.send({"id": book.id});
            }
        });
    }
});

router.patch('/:id', (request, response, next) => {
    BookSchema
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
                result.save((error, book) => {
                    if(error) {
                        response.status(500).send(error);
                    }
                    response.send(book);
                });
            }
            else {
                response.status(404).send({"id": request.params.id, "error": "Not Found"});
            }
        });
});

router.delete('/:id', (request, response, next) => {
    BookSchema
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
// controllers/taskController.js
// Importacio del model
const Task = require('../models/Task')


// ---------------------------------
//    OBTENIR TOTES LES TASQUES
// ---------------------------------
exports.getTasks = (req, res) => {
    Task.find()
        .then(tasks => {
            res.status(200).send(tasks);
        })
        .catch(err => {
            res.status(500).send(
                {
                    error: 'Error obtenint les tasques',
                    details: err.message
                }
            )
        }
    );
}

// ---------------------------------
//      OBTENIR UNA TASCA ESPECÍFICA
// ---------------------------------
exports.getTaskById = (req, res) => {
    Task.findById(req.params.id)
        .then(task => {
            if (!task) {
                return res.status(404).send({ message: 'Tasca no trobada' });
            }
            res.status(200).send(task);
        })
        .catch(err => {
            res.status(500).send({
                error: 'Error obtenint la tasca',
                details: err.message
            });
        });
};

// ---------------------------------
//         CREAR UNA TASCA
// ---------------------------------

exports.createTask = (req, res) => {
    const task = new Task(req.body);

    task
        .save() // Guardar la tasca a la base de dades
        .then(savedTask => {
            res.status(201).send(savedTask); // retornar la tasca creada.
        })
        .catch(err => {
            res.status(400).send(
                {
                    error: 'No s\'ha pogut crear la tasca',
                    details: err.message
                }
            );
        }
    );
};


// ---------------------------------
//      ACTUALITZAR LA TASCA
// ---------------------------------

exports.updateTask = (req, res) => {
    Task.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {
            new: true,
            runValidators: true
        }
    )

    // Actualitzar la tasca
    .then(updatedTask => {
        if(!updatedTask) {
            return res.status(404).send(
                {
                    message: 'Producte no trobat'
                }
            );
        }

        // Enviar tasca actualitzada
        res.status(200).send(updatedTask);
    })
    .catch(err => {
        res.status(400).send(
            {
                error: 'Error al actualitzar la tasca.',
                details: err.message
            }
        );
    });
};


// ---------------------------------
//       ELIMINAR UNA TASCA
// ---------------------------------

exports.deleteTask = (req, res) => {
    Task.findByIdAndDelete(
        req.params.id
    ) // Eliminar tasca
    .then(deletedTask => {
        if(!deletedTask) {
            return res.status(404).send(
                {
                    message: 'Tasca no trobada'
                }
            );
        }
        res.status(200).send(
            {
                message: 'Tasca eliminada amb èxit',
                producte: deletedTask
            }
        );
    })
    .catch(err => {
        res.status(500).send(
            {
                error: 'Error eliminant la tasca',
                details: err.message
            }
        );
    });
};
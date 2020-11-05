/*
 * Controller de CLIENTES
 */

const sql = require("mssql");
const dbPVI = require('../database/PVI');
const usuarioBeatriz = 2067
const usuarioApaixonados = 2073

exports.all = (req, res) => {

    // TODO: verifica perfil do usuário, listando apenas os registros que ele pode visualizar

    let limit = parseInt(req.query.limit) || 25;   // itens por página
    let page = parseInt(req.query.page) || 1;      // número da página
    let offset = limit * (page - 1);

    var qry = `SELECT
		ID,
		NOME,
		CPFCNPJ AS CPF,
		rgnumero AS RG,
		CELULAR AS TELEFONE,
		EMAIL 
		FROM PESSOA (nolock) WHERE 1=1`;

    var isInject = 0;
    var arrayBloqueioInject = ['SELECT ', 'INSERT ', 'DROP ', 'UPDATE ', 'DELETE ', 'TABLE ', 'FROM ', 'DATABASE '];
    for (var key in req.query) {
        arrayBloqueioInject.forEach(function (item) {
            var re = new RegExp(item);
            if (req.query[key].toUpperCase().match(re)) isInject++
        })
        var nomeCampo = key
        if (key == 'cpf') nomeCampo = 'cpfcnpj'
        if (key == 'rg') nomeCampo = 'rgnumero'
        if (key == 'telefone') nomeCampo = 'celular'

        if (key == 'id') {
            qry += ' AND ' + nomeCampo + " = " + req.query[key]
        } else {
            qry += ' AND ' + nomeCampo + " = '" + req.query[key] + "'"
        }


    }


    if (isInject >= 2) {
        res.status(500).json({
            MSG: "Parametros passados são invalidos!!",
        });

    } else {
        sql.close();
        sql.connect(dbPVI).then(pool => {
            new sql.Request().query(qry, (err, result) => {
                if (!err) {


                    res.status(200).json({
                        OBJETO: "Clientes",
                        MSG: "Informações de clientes retornadas com sucesso.",
                        RESULTADO: result.recordset

                    });

                } else {
                    res.status(500).json({
                        MSG: "Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                        DETALHES: err,
                    });
                }
            });
        })


    }



};

// retorna as informações de uma pessoa específica
exports.one = (req, res) => {

    sql.close();
    sql.connect(dbPVI).then(pool => {
        var qry = `SELECT
		ID,
		NOME,
		CPFCNPJ AS CPF,
		rgnumero AS RG,
		CELULAR AS TELEFONE,
		EMAIL 
		FROM PESSOA (nolock)
		WHERE ID = @ID`;

        new sql.Request().input('ID', sql.NVarChar, req.params.id).query(qry, (err, result) => {
            if (!err) {

                if (result.recordset.length) {
                    res.status(200).json({
                        OBJETO: "Clientes",
                        MSG: "Informações do cliente retornadas com sucesso.",
                        RESULTADO: result.recordset[0]
                    });
                } else {
                    res.status(200).json({
                        OBJETO: "Clientes",
                        MSG: "Informações do cliente não enontrado.",
                        RESULTADO: null
                    });
                }


            } else {
                res.status(500).json({
                    MSG: "Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                    DETALHES: err,
                });
            }
        });


    })



};

// cria o registro de uma pessoa
exports.create = (req, res) => {
    let dadosCliente = req.body;

    sql.close();
    sql.connect(dbPVI).then(pool => {
        var qryInsert = `INSERT INTO PESSOA 
	(NOME, CPFCNPJ, RGNUMERO, CELULAR, EMAIL, DATAHORACADASTRO)
	 VALUES 
	(@NOME, @CPF, @RG, @TELEFONE, @EMAIL, GETDATE())`;

        new sql.Request()
            .input('NOME', sql.NVarChar, dadosCliente.NOME)
            .input('CPF', sql.NVarChar, dadosCliente.CPF)
            .input('RG', sql.NVarChar, dadosCliente.RG)
            .input('TELEFONE', sql.NVarChar, dadosCliente.TELEFONE)
            .input('EMAIL', sql.NVarChar, dadosCliente.EMAIL)
            .query(qryInsert, (err, result) => {
                if (!err) {


                    sql.close();
                    sql.connect(dbPVI).then(pool => {
                        var qry = `SELECT
			ID,
			NOME,
			CPFCNPJ AS CPF,
			rgnumero AS RG,
			CELULAR AS TELEFONE,
			EMAIL 
			FROM PESSOA (nolock)
			WHERE 
			NOME = @NOME 
			AND CPFCNPJ = @CPF
			AND RGNUMERO = @RG
			AND CELULAR = @TELEFONE
			AND EMAIL = @EMAIL`;

                        new sql.Request()
                            .input('NOME', sql.NVarChar, dadosCliente.NOME)
                            .input('CPF', sql.NVarChar, dadosCliente.CPF)
                            .input('RG', sql.NVarChar, dadosCliente.RG)
                            .input('TELEFONE', sql.NVarChar, dadosCliente.TELEFONE)
                            .input('EMAIL', sql.NVarChar, dadosCliente.EMAIL)
                            .query(qry, (err, result) => {
                                if (!err) {

                                    if (result.recordset.length) {
                                        res.status(200).json({
                                            OBJETO: "Clientes",
                                            MSG: "Registro do cliente criado com sucesso.",
                                            RESULTADO: result.recordset[0]
                                        });
                                    } else {
                                        res.status(200).json({
                                            OBJETO: "Clientes",
                                            MSG: "Erro ao criar registro de cliente.",
                                            RESULTADO: null
                                        });
                                    }


                                } else {
                                    res.status(500).json({
                                        MSG: "Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                                        DETALHES: err,
                                    });
                                }
                            });


                    })



                } else {
                    res.status(500).json({
                        MSG: "Ocorreu um erro desconhecido ao criar o registro de clientes.",
                        DETALHES: err,
                    });
                }
            });


    })



};

// atualiza os registros de uma pessoa
exports.update = (req, res) => {
    let dadosCliente = req.body;

    sql.close();
    sql.connect(dbPVI).then(pool => {
        var qryUpdate = `UPDATE PESSOA
	SET 
	NOME = @NOME,
	CPFCNPJ = @CPF,
	RGNUMERO = @RG,
	CELULAR = @TELEFONE,
	EMAIL = @EMAIL
	WHERE ID = @ID`;

        new sql.Request()
            .input('NOME', sql.NVarChar, dadosCliente.NOME)
            .input('ID', sql.NVarChar, req.params.id)
            .input('CPF', sql.NVarChar, dadosCliente.CPF)
            .input('RG', sql.NVarChar, dadosCliente.RG)
            .input('TELEFONE', sql.NVarChar, dadosCliente.TELEFONE)
            .input('EMAIL', sql.NVarChar, dadosCliente.EMAIL)
            .query(qryUpdate, (err, result) => {
                if (!err) {

                    sql.close();
                    sql.connect(dbPVI).then(pool => {
                        var qry = `SELECT
			ID,
			NOME,
			CPFCNPJ AS CPF,
			rgnumero AS RG,
			CELULAR AS TELEFONE,
			EMAIL 
			FROM PESSOA (nolock)
			WHERE 
			ID = @ID`;

                        new sql.Request()
                            .input('ID', sql.NVarChar, req.params.id)
                            .query(qry, (err, result) => {
                                if (!err) {

                                    if (result.recordset.length) {
                                        res.status(200).json({
                                            OBJETO: "Clientes",
                                            MSG: "Registro do cliente atualizado com sucesso.",
                                            RESULTADO: result.recordset[0]
                                        });
                                    } else {
                                        res.status(200).json({
                                            OBJETO: "Clientes",
                                            MSG: "Erro ao atualizar registro de cliente.",
                                            RESULTADO: null
                                        });
                                    }


                                } else {
                                    res.status(500).json({
                                        MSG: "Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                                        DETALHES: err,
                                    });
                                }
                            });

                    })




                } else {
                    res.status(500).json({
                        MSG: "Ocorreu um erro desconhecido ao atualizar o registro de clientes.",
                        DETALHES: err,
                    });
                }
            });


    })


};

//CHAT BOT BRZ
//verifica se o cpf informado ja existe
exports.getCPF = (req, res, next) => {
    var cpf = req.body.CPFCNPJ
    if (!cpf) {
        next()
        return
    }
    sql.close()
    sql.connect(dbPVI).then(pool => {
        cpf = cpf.replace(/[^\w+\s]/gi, '')
        var requestPVI = new sql.Request()
        var queryFindByCPF = `SELECT ID
						FROM PESSOA
						WHERE CPFCNPJ = '${cpf}'`;
        requestPVI.query(queryFindByCPF, (err, result) => {
            if (!err) { // deu tudo certo
                var respRegistros = result.recordset
                // adiciona a key de ID para ser possivel fazer o update do cadastro
                if (respRegistros.length) {
                    req.body.ID = respRegistros[0].ID
                }
                next()
                return
            } else {
                return res.status(500).json({
                    MSG: 'Ocorreu um erro desconhecido ao verificar o cpf informado',
                    DETALHES: err
                })
            }
        })
    })
}

// atualiza os registros de uma pessoa
exports.setCliente = (req, res) => {
    let dadosCliente = req.body;
    sql.close();
    sql.connect(dbPVI).then(pool => {
        var requestPVI = new sql.Request()
        var primaryKeys = ['CPFCNPJ', 'CELULAR', 'EMAIL', 'ID'];
        if (!Object.keys(dadosCliente).length) {

            return res.status(403).json({
                MSG: "Erro ao atualizar cadastro!",
                DETALHES: 'Nenhum parametro informado para cadastro.',
            });

        }


        if (dadosCliente.ID && dadosCliente.ID != '' && dadosCliente != 'null') {
            sql.close();
            sql.connect(dbPVI).then(pool => {
                try {
                    var updatePVI = new sql.Request()
                    var qryUpdate = `UPDATE PESSOA
					SET `;
                    var listaToUpdate = []
                    for (var key in dadosCliente) {
                        if (dadosCliente[key] != '') {
                            if (key != 'ID') {
                                listaToUpdate.push(` ${key} = @${key} `);
                            }
                        }
                    }
                    qryUpdate += listaToUpdate.join(',')
                    qryUpdate += ' WHERE ID = @ID '
                    for (var key in dadosCliente) {
                        if (dadosCliente[key] != '') {
                            if (key != 'EMAIL' && key != 'NOME') {
                                dadosCliente[key] = String(dadosCliente[key]).toUpperCase().replace(/[^\w+\s]/gi, '')
                            } else {
                                dadosCliente[key] = dadosCliente[key].toLowerCase()
                            }
                            updatePVI.input(key, sql.NVarChar, dadosCliente[key])
                        }
                    }
                } catch (e) {
                    return res.status(500).json({
                        MSG: "Ocorreu um erro desconhecido ao atualizar o cadastro de clientes.",
                        DETALHES: e,
                    });
                }
                updatePVI.query(qryUpdate, (err, result) => {
                    if (!err) {
                        return res.status(200).json({
                            OBJETO: "Clientes",
                            MSG: "Informações do cliente atualizadas com sucesso.",
                            RESULTADO: {
                                ID: dadosCliente.ID
                            }
                        });
                    } else {
                        return res.status(500).json({
                            MSG: "Ocorreu um erro desconhecido ao atualizar o cadastro de clientes.",
                            DETALHES: err,
                        });
                    }
                });
            })
        } else {
            sql.close();
            sql.connect(dbPVI).then(pool => {
                try {
                    var insertPVI = new sql.Request()
                    var qryInsert = `INSERT INTO PESSOA `;
                    var listaToInsert = []
                    for (var key in dadosCliente) {
                        if (dadosCliente[key] != '') {
                            listaToInsert.push(`${key}`);
                        }
                    }

                    listaToInsert.push('DATAHORACADASTRO');
                    listaToInsert.push('midia_id');
                    listaToInsert.push('formacontato_id');
                    listaToInsert.push('situacaopessoa_id');
                    listaToInsert.push('tipo');
                    listaToInsert.push('tipopessoa');
					listaToInsert.push('usuariocriacao_id');
					listaToInsert.push('situacaocadastropessoa_id');

                    qryInsert += '(' + listaToInsert.join(',') + ')';
                    qryInsert += ' VALUES '
                    listaToInsert = []
                    for (var key in dadosCliente) {
                        if (dadosCliente[key] != '') {
                            listaToInsert.push(`@${key}`);
                        }
                    }

                    listaToInsert.push('GETDATE()');
                    listaToInsert.push(15);
                    listaToInsert.push(10);
                    listaToInsert.push(1);
                    listaToInsert.push(4);
                    listaToInsert.push(1);
					listaToInsert.push(usuarioBeatriz);
					listaToInsert.push(3);

                    qryInsert += '(' + listaToInsert.join(',') + ')';

                    for (var key in dadosCliente) {
                        if (dadosCliente[key] != '') {
                            if (key != 'EMAIL' && key != 'NOME') {
                                dadosCliente[key] = String(dadosCliente[key]).toUpperCase().replace(/[^\w+\s]/gi, '')
                            } else {
                                dadosCliente[key] = String(dadosCliente[key]).toLowerCase()
                            }
                            insertPVI.input(key, sql.NVarChar, dadosCliente[key])
                        }
                    }
                } catch (e) {
                    return res.status(500).json({
                        MSG: "Ocorreu um erro desconhecido ao inserir o cadastro de clientes.",
                        DETALHES: e,
                    });
                }
                insertPVI.query(qryInsert, (err, result) => {
                    if (!err) {
                        sql.close();
                        sql.connect(dbPVI).then(pool => {
                            var requestPVI = new sql.Request()
                            var selectCliente = `SELECT ID,
							NOME,
							CPFCNPJ,
							CELULAR,
							EMAIL FROM PESSOA
						WHERE 1=1`;

                            for (var key in dadosCliente) {
                                if (dadosCliente[key] != '') {
                                    selectCliente += ` AND ${key} = @${key}`;
                                }
                            }
                            for (var key in dadosCliente) {
                                if (dadosCliente[key] != '') {
                                    if (key != 'EMAIL' && key != 'NOME') {
                                        dadosCliente[key] = String(dadosCliente[key]).toUpperCase().replace(/[^\w+\s]/gi, '')
                                    } else {
                                        dadosCliente[key] = String(dadosCliente[key]).toLowerCase()
                                    }
                                    requestPVI.input(key, sql.NVarChar, dadosCliente[key])
                                }
                            }
                            requestPVI.query(selectCliente, (err, result) => {
                                if (!err) {
                                    var maxId = null
                                    result.recordset.forEach(function (ele) {
                                        if (!maxId) {

                                            maxId = ele
                                        } else {
                                            if (Number(maxId.ID) < Number(ele.ID)) {

                                                maxId = ele
                                            }

                                        }

                                    })
									
									var insertTimeline = new sql.Request()
                                    var qryInsert = `INSERT INTO ANOTACAOPESSOA 
                                    (pessoa_id,usuario_id,datahora,mensagem,formacontato_id)
                                    VALUES 
                                    (@ID, ${usuarioBeatriz},getdate(), @INFO ,10)`;
                                    
                                    insertTimeline
									.input('ID', sql.NVarChar, maxId.ID)
									.input('INFO', sql.NVarChar, "Cliente Cadastrado! Forma de Contato: Beatriz")
									.query(qryInsert, (error, response) => {
                                        if(error){
                                            return res.status(500).json({
                                                MSG: "Cliente cadastrado. Ocorreu um erro desconhecido ao inserir os dados da timeline.",
                                                DETALHES: error,
                                            });
                                        }else{
                                            return res.status(200).json({
                                                OBJETO: "Clientes",
                                                MSG: "Informações do cliente cadastradas com sucesso.",
                                                RESULTADO: maxId
                                            });
                                        }
                                    });

                                } else {
                                    return res.status(500).json({
                                        MSG: "Cliente cadastrado. Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                                        DETALHES: err,
                                    });
                                }
                            });
                        })
                    } else {
                        return res.status(500).json({
                            MSG: "Ocorreu um erro desconhecido ao inserir o cadastro de clientes.",
                            DETALHES: err,
                        });
                    }
                });
            })
        }
    })
};

// Grava o ticket na timeline
exports.setTicketOnTimeline = (req,res) => {
	var params = req.body; //{ID: XXXXX, TICKET: XXXXX}

	sql.close();
	sql.connect(dbPVI).then(pool => {
		var insertTimeline = new sql.Request()
	    var qryInsert = `INSERT INTO ANOTACAOPESSOA 
	    (pessoa_id,usuario_id,datahora,mensagem,formacontato_id)
	    VALUES 
	    (@ID, ${usuarioBeatriz},getdate(), @INFO ,10)`;
	    
	    insertTimeline
		.input('ID', sql.NVarChar, params.ID)
		.input('INFO', sql.NVarChar, `Atendimento Finalizado: Ticket ${params.TICKET}`)
		.query(qryInsert, (error, response) => {
	        if(error){
	            return res.status(500).json({
	                MSG: "Ocorreu um erro desconhecido ao inserir os dados da timeline.",
	                DETALHES: error,
	            });
	        }else{
	            return res.status(200).json({
	                OBJETO: "Clientes",
	                MSG: "Informações inseridas com sucesso.",
	                RESULTADO: params.TICKET
	            });
	        }
	    });
	})
};

// resgata os registros de uma pessoa
exports.getCliente = (req, res) => {
    let dadosCliente = req.body;

    sql.close();
    sql.connect(dbPVI).then(pool => {
        var requestPVI = new sql.Request()


        if (!Object.keys(dadosCliente).length) {
            res.status(403).json({
                MSG: "Erro ao atualizar cadastro.",
                DETALHES: 'Nenhum parametro informado para cadastro.',
            });
        }

        var selectCliente = `SELECT ID,
                             NOME,
                             CPFCNPJ,
                             CELULAR,
                             EMAIL FROM PESSOA
                             WHERE 1=1`;

        for (var key in dadosCliente) {
            selectCliente += ` AND ${key} = @${key}`;
        }

        for (var key in dadosCliente) {
            if (key != 'EMAIL' && key != 'NOME') {
                dadosCliente[key] = String(dadosCliente[key]).toUpperCase().replace(/[^\w+\s]/gi, '')
            } else {
                dadosCliente[key] = String(dadosCliente[key]).toLowerCase()
            }
            requestPVI.input(key, sql.NVarChar, dadosCliente[key])
        }

        requestPVI.query(selectCliente, (err, result) => {
            if (!err) {
                res.status(200).json({
                    OBJETO: "Clientes",
                    MSG: "Informações de clientes retornadas com sucesso.",
                    RESULTADO: result.recordset
                });

            } else {
                res.status(500).json({
                    MSG: "Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                    DETALHES: err,
                });
            }
        });

    })


};

// resgata os registros de uma pessoa
exports.getClienteUnico = (req, res) => {
    let dadosCliente = JSON.parse(JSON.stringify(req.body))	// copia o objeto sem criar uma referencia
	console.log(new Date().toString(),'getClienteUnico',dadosCliente)

    sql.close();
    sql.connect(dbPVI).then(pool => {
        var requestPVI = new sql.Request()


        if (!Object.keys(dadosCliente).length) {
            res.status(403).json({
                MSG: "Erro ao atualizar cadastro.",
                DETALHES: 'Nenhum parametro informado para cadastro.',
            });
        }
		dadosCliente.EMAIL = String(dadosCliente.EMAIL).toLowerCase()

        var selectCliente = `SELECT ID,
                             NOME,
                             CPFCNPJ,
                             CELULAR,
                             EMAIL FROM PESSOA
                             WHERE EMAIL = @EMAIL `;
		
		if(dadosCliente.CPFCNPJ){
			dadosCliente.CPFCNPJ = String(dadosCliente.CPFCNPJ).replace(/[^\d]/g, '')		
			selectCliente += `OR CPFCNPJ = @CPFCNPJ `;
		}
        for (var key in dadosCliente) {
			if(dadosCliente[key] != ''){
				requestPVI.input(key, sql.NVarChar, dadosCliente[key])
			}
        }

        requestPVI.query(selectCliente, (err, result) => {
            if (!err) {
                res.status(200).json({
                    OBJETO: "Clientes",
                    MSG: "Informações de clientes retornadas com sucesso.",
                    RESULTADO: result.recordset
                });

            } else {
                res.status(500).json({
                    MSG: "Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
                    DETALHES: err,
                });
            }
        });

    })


};

exports.queryteste = (req, res) => {
	
	sql.close();
	sql.connect(dbPVI).then(pool => {
		var teste = new sql.Request()
		var queryTeste = req.body.query
		
		teste.query(queryTeste, (err, result) => {
			if(!err){
				return res.status(200).json({
				MSG: "SUCESSO!!",
				DETALHES: result.recordset
				})
			}else{
				return res.status(500).json({
				MSG: "ERRO ):",
				DETALHES: err
				})
			}
		})
		
	})
}

exports.setClienteBeatrizPrincipal = (req, res) => {
    let dadosCliente = JSON.parse(JSON.stringify(req.body))	// copia o objeto sem criar uma referencia
	console.log(new Date().toString(),'setClienteBeatrizPrincipal',dadosCliente)
	console.log('igualdade', dadosCliente == req.body)
    sql.close();
    sql.connect(dbPVI).then(async pool => {
        var requestPVI = new sql.Request()
        var primaryKeys = ['CPFCNPJ', 'CELULAR', 'EMAIL', 'ID'];
        if (!Object.keys(dadosCliente).length) {

            return res.status(403).json({
                MSG: "Erro ao atualizar cadastro!",
                DETALHES: 'Nenhum parametro informado para cadastro.',
            });

        }
		
		if(dadosCliente.EMAIL && dadosCliente.CELULAR && dadosCliente.NOME && (!dadosCliente.ID) ){
			try{
				
				var insertPVI = new sql.Request()
				var qryInsert = `INSERT INTO PESSOA `;
				var listaToInsert = []
				for (var key in dadosCliente) {
					if (dadosCliente[key] != '') {
						listaToInsert.push(`${key}`);
					}
				}

				listaToInsert.push('DATAHORACADASTRO');
				listaToInsert.push('midia_id');
				listaToInsert.push('formacontato_id');
				listaToInsert.push('situacaopessoa_id');
				listaToInsert.push('tipo');
				listaToInsert.push('tipopessoa');
				listaToInsert.push('usuariocriacao_id');
				listaToInsert.push('situacaocadastropessoa_id');

				qryInsert += '(' + listaToInsert.join(',') + ')';
				qryInsert += ' VALUES '
				listaToInsert = []
				for (var key in dadosCliente) {
					if (dadosCliente[key] != '') {
						listaToInsert.push(`@${key}`);
					}
				}

				listaToInsert.push('GETDATE()');
				listaToInsert.push(15);
				listaToInsert.push(10);
				listaToInsert.push(1);
				listaToInsert.push(4);
				listaToInsert.push(1);
				listaToInsert.push(usuarioBeatriz);
				listaToInsert.push(3);

				qryInsert += '(' + listaToInsert.join(',') + ')';

				for (var key in dadosCliente) {
					if (dadosCliente[key] != '') {
						switch(key){
							case 'CPFCNPJ':
								dadosCliente[key] = String(dadosCliente[key]).replace(/[^\d]/g, '')
							break;
							case 'EMAIL':
							case 'NOME':
								dadosCliente[key] = String(dadosCliente[key]).toLowerCase()
							break;
							
							default: //celular entra nesta REGEX
								dadosCliente[key] = String(dadosCliente[key]).toUpperCase().replace(/[^\w+\s]/gi, '')
							break;
						}
						insertPVI.input(key, sql.NVarChar, dadosCliente[key])						
					}
                }
                sql.close();
                await sql.connect(dbPVI)
				insertPVI.query(qryInsert, (err, result) => {
					try{
						console.log('insert pvi')
						if (!err) {
							console.log('insert pvi deu certo')
							var requestPVI = new sql.Request()
							var selectCliente = `SELECT ID,
												 NOME,
												 CPFCNPJ,
												 CELULAR,
												 EMAIL FROM PESSOA
												 WHERE 1=1`;

							for (var key in dadosCliente) {
								if (dadosCliente[key] != '') {
									selectCliente += ` AND ${key} = @${key}`;
									requestPVI.input(key, sql.NVarChar, dadosCliente[key]);
								}
							}
                            console.log('selectCliente',selectCliente)
                            sql.close();
                            await sql.connect(dbPVI)
							requestPVI.query(selectCliente, (err, result) => {
								try{
									console.log('request pvi')
									if (!err) {
										console.log('request pvi deu certo')
										var maxId = null
										result.recordset.forEach(function (ele) {
											if (!maxId) {

												maxId = ele
											} else {
												if (Number(maxId.ID) < Number(ele.ID)) {

													maxId = ele
												}

											}

										})
										var insertTimeline = new sql.Request()
										var qryInsert = `INSERT INTO ANOTACAOPESSOA 
										(pessoa_id,usuario_id,datahora,mensagem,formacontato_id)
										VALUES 
										(@ID, ${usuarioBeatriz},getdate(), @INFO ,10)`;
										console.log('insere timeline')
										insertTimeline
										.input('ID', sql.NVarChar, maxId.ID)
                                        .input('INFO', sql.NVarChar, "Cliente Cadastrado! Forma de Contato: Beatriz")
                                        sql.close();
                                        await sql.connect(dbPVI)
										.query(qryInsert, (error, response) => {
											if(error){
												console.log('insere timeline deu errado')
												return res.status(500).json({
													MSG: "Cliente cadastrado. Ocorreu um erro desconhecido ao inserir os dados da timeline.",
													DETALHES: error,
												});
											}else{
												console.log('insere timeline deu certo')
												return res.status(200).json({
													OBJETO: "Clientes",
													MSG: "Informações do cliente cadastradas com sucesso.",
													RESULTADO: maxId
												});
											}
										});

									} else {
										console.log('erro no request pvi')
										return res.status(500).json({
											MSG: "Cliente cadastrado. Ocorreu um erro desconhecido ao consultar o cadastro de clientes.",
											DETALHES: err,
										});
									}
								}catch(err){
									console.log(new Date().toString(),'ERRO 1',err)
									return res.status(500).json({
										MSG: "Ocorreu um erro desconhecido ao buscar dados do cliente.",
										DETALHES: err.message || err,
									});
								}								
								
							});
							
						} else {
							console.log(new Date().toString(),'ERRO 2',err)
							return res.status(500).json({
								MSG: "Ocorreu um erro desconhecido ao inserir o cadastro de clientes.",
								DETALHES: err,
							});
						}
					}catch(err){
						console.log(new Date().toString(),'ERRO 3',err)
						return res.status(500).json({
							MSG: "Ocorreu um erro desconhecido ao buscar dados do cliente.",
							DETALHES: err.message || err,
						});
					}
				});
				
					return res.status(200).json({
						OBJETO: "Clientes",
						MSG: "Seleção de dados feita com sucesso!",
						RESULTADO: {
							ID: dadosCliente.ID || ''
						}
					});

                
				
			} catch (e) {
				console.log(new Date().toString(),'ERRO 4',e)
				return res.status(500).json({
					MSG: "Ocorreu um erro desconhecido ao buscar dados do cliente.",
					DETALHES: e.message || e,
				});
			}
		}else{
			return res.status(200).json({
				MSG: "Cliente já existe no PVI ou não informou os dados corretamente.."
			});
		}
    })
};



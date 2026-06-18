import readline from 'readline';
import { Estudante } from './models/Estudante.js';
import { Professor } from './models/Professor.js';
import { Empresa } from './models/Empresa.js';

export class InterfaceUsuario {
    constructor(cadastro, estacionamento, relatorios, persistencia) {
        this.cadastro = cadastro;
        this.estacionamento = estacionamento;
        this.relatorios = relatorios;
        this.persistencia = persistencia;
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    exibirMenu() {
        console.log("\n=== SISTEMA DE ESTACIONAMENTO ===");
        console.log("1. Cadastrar novo cliente");
        console.log("2. Registrar Entrada de Veículo");
        console.log("3. Registrar Saída de Veículo");
        console.log("4. Relatório: Situação de um Cliente");
        console.log("5. Relatório: Clientes Impedidos");
        console.log("6. Relatório: Top 10 Clientes do Ano");
        console.log("7. Salvar dados e Sair");
        console.log("=========================================");
        
        this.rl.question("Escolha uma opção: ", (opcao) => this.processarOpcao(opcao));
    }

    processarOpcao(opcao) {
        switch (opcao) {
            case '1':
                this.rl.question("Tipo (1-Estudante, 2-Professor, 3-Empresa): ", (tipo) => {
                    this.rl.question("Documento (CPF/CNPJ): ", (doc) => {
                        this.rl.question("Nome: ", (nome) => {
                            let cliente;
                            if (tipo === '1') cliente = new Estudante(doc, nome);
                            else if (tipo === '2') cliente = new Professor(doc, nome);
                            else if (tipo === '3') cliente = new Empresa(doc, nome);
                            
                            if (cliente) {
                                this.cadastro.cadastrarCliente(cliente);
                                console.log(`\n${nome} cadastrado com sucesso!`);
                            } else {
                                console.log("\nTipo de cliente inválido.");
                            }
                            this.exibirMenu();
                        });
                    });
                });
                break;
                
            case '2':
                this.rl.question("Digite a placa para entrada: ", (placa) => {
                    this.estacionamento.autorizarEntrada(placa.toUpperCase());
                    this.exibirMenu();
                });
                break;
                
            case '3':
                this.rl.question("Digite a placa para saída: ", (placa) => {
                    try {
                        this.estacionamento.processarSaida(placa.toUpperCase());
                    } catch (e) {
                        console.log(`\nERRO: ${e.message}`);
                    }
                    this.exibirMenu();
                });
                break;
                
            case '4':
                this.rl.question("Digite o CPF/CNPJ do cliente: ", (doc) => {
                    console.log("\n--- Situação do Cliente ---");
                    console.log(this.relatorios.situacaoCliente(doc));
                    this.exibirMenu();
                });
                break;
                
            case '5':
                console.log("\n--- Clientes Impedidos ---");
                const impedidos = this.relatorios.clientesImpedidos();
                if (impedidos.length === 0) {
                    console.log("Nenhum cliente ou veículo impedido no momento.");
                } else {
                    impedidos.forEach(imp => console.log(`- ${imp}`));
                }
                this.exibirMenu();
                break;
                
            case '6':
                this.rl.question("Digite o ano para gerar o ranking (ex: 2025): ", (ano) => {
                    console.log(`\n--- Top 10 Mais Frequentes de ${ano} ---`);
                    const ranking = this.relatorios.top10Frequentes(Number(ano));
                    if (ranking.length === 0) {
                        console.log("Nenhum registro encontrado para este ano.");
                    } else {
                        ranking.forEach(pos => console.log(pos));
                    }
                    this.exibirMenu();
                });
                break;
                
            case '7':
                console.log("\nSalvando dados...");
                this.persistencia.salvarClientes('./clientes.csv', this.cadastro);
                this.persistencia.salvarTickets('./registros.csv', this.estacionamento);
                
                console.log("Dados salvos com sucesso! Sistema encerrado.");
                this.rl.close();
                break;
                
            default:
                console.log("\nOpção inválida! Tente novamente.");
                this.exibirMenu();
                break;
        }
    }
}
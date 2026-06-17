import { CadastroClientes } from './services/CadastroClientes.js';
import { RegistroDeEntradas_E_Saidas } from './services/RegistroDeEntradas_E_Saidas';
import { Professor } from './models/Professor.js';
import { Estudante } from './models/Estudante.js';

// Teste de funcionamento
// 1. Inicializando os Gerenciadores
const cadastro = new CadastroClientes();
const estacionamento = new RegistroDeEntradas_E_Saidas(cadastro);

console.log("--- INICIANDO SISTEMA ---");

// 2. Cadastrando Clientes de Teste
const prof = new Professor("12345678901", "Ana Costa");
prof.adicionarPlaca("MNO-5H67");
cadastro.cadastrarCliente(prof);

const est = new Estudante("98765432100", "João Silva");
est.saldo = 30; // Inserindo R$30 de crédito 
est.adicionarPlaca("ABC-1D23");
cadastro.cadastrarCliente(est);

console.log("\n--- TESTANDO ENTRADAS ---");

// Estudante entra
console.log("Tentativa: Estudante (ABC-1D23)");
estacionamento.autorizarEntrada("ABC-1D23");

// Professor entra
console.log("\nTentativa: Professor (MNO-5H67)");
estacionamento.autorizarEntrada("MNO-5H67");

// Cliente Avulso entra (placa não cadastrada)
console.log("\nTentativa: Avulso (XYZ-9999)");
const ticketAvulso = estacionamento.autorizarEntrada("XYZ-9999");

console.log("\n--- TESTANDO BLOQUEIOS ---");

// Professor tenta entrar com o mesmo carro que já está lá dentro
console.log("Tentativa: Professor já estacionado (MNO-5H67)");
estacionamento.autorizarEntrada("MNO-5H67"); 

console.log("\n--- TESTANDO SAÍDAS E COBRANÇAS ---");

// Simulando que o avulso ficou 4 horas no estacionamento
// (Voltamos o relógio da entrada dele em 4 horas para o teste)
ticketAvulso.dataEntrada.setHours(ticketAvulso.dataEntrada.getHours() - 4);

console.log("Saída: Avulso (4 horas de permanência)");
estacionamento.processarSaida("XYZ-9999");

console.log("\nSaída: Estudante");
estacionamento.processarSaida("ABC-1D23");
console.log(`Saldo final do estudante ${est.nome}: R$${est.saldo}`);

console.log("\nSaída: Professor");
estacionamento.processarSaida("MNO-5H67");
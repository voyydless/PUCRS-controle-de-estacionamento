import { CadastroClientes } from './services/CadastroClientes.js';
import { RegistroDeEntradas_E_Saidas } from './services/RegistroDeEntradas_E_Saidas.js';
import { RelatoriosGerenciais } from './managers/RelatoriosGerenciais.js';
import { PersistenciaCSV } from './managers/PersistenciaCSV.js';
import { InterfaceUsuario } from './InterfaceUsuario.js';

const ARQUIVO_CLIENTES = './clientes.csv';
const ARQUIVO_REGISTROS = './registros.csv';

console.log("Iniciando Sistema...");
console.log("Carregando banco de dados...");

const cadastro = new CadastroClientes();
const estacionamento = new RegistroDeEntradas_E_Saidas(cadastro);
const relatorios = new RelatoriosGerenciais(cadastro, estacionamento);

try {
    PersistenciaCSV.carregarClientes(ARQUIVO_CLIENTES, cadastro);
    PersistenciaCSV.carregarTickets(ARQUIVO_REGISTROS, estacionamento, cadastro);
    console.log("Dados carregados com sucesso!");
} catch (error) {
    console.log("Nenhum banco de dados anterior encontrado ou erro ao ler arquivos. Iniciando sistema vazio.");
}

const ui = new InterfaceUsuario(cadastro, estacionamento, relatorios, PersistenciaCSV);
ui.exibirMenu();
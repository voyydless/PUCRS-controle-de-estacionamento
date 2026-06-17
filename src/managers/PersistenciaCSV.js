import fs from 'fs';
import { Estudante } from '../models/Estudante.js';
import { Professor } from '../models/Professor.js';
import { Empresa } from '../models/Empresa.js';
import { TicketEstacionamento } from '../models/TicketEstacionamento.js';

export class PersistenciaCSV {
    
    // Lê o arquivo de clientes e recria os objetos correspondentes na memória
    static carregarClientes(caminhoArquivo, cadastro) {
        // Se for a primeira execução e o arquivo não existir, aborta a leitura com segurança
        if (!fs.existsSync(caminhoArquivo)) return;

        const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
        // Divide o conteúdo em linhas e remove as linhas em branco do final do arquivo
        const linhas = conteudo.split(/\r?\n/).filter(l => l.trim().length > 0);

        for (const linha of linhas) {
            const cols = linha.split(',').map(s => s.trim());
            
            // A terceira coluna do CSV determina a regra do cliente
            const campo2 = cols[2] || '';
            const ehNumero = !isNaN(Number(campo2));

            if (ehNumero && cols.length >= 5) {
                const [cpf, nome, valorStr, tipo, ...placas] = cols;
                
                if (tipo.toUpperCase() === 'ESTUDANTE') {
                    const cli = new Estudante(cpf, nome);
                    cli.saldo = Number(valorStr); // Converte a string do CSV de volta para número
                    if (placas[0]) cli.adicionarPlaca(placas[0]);
                    cadastro.cadastrarCliente(cli);
                    
                } else if (tipo.toUpperCase() === 'EMPRESA') {
                    const cli = new Empresa(cpf, nome); // O CPF lido aqui na verdade representa o CNPJ da empresa
                    cli.debitoAcumulado = Number(valorStr);
                    for (const p of placas) if (p) cli.adicionarPlaca(p);
                    cadastro.cadastrarCliente(cli);
                }
                
            } else if (campo2.toUpperCase() === 'PROFESSOR') {
                const [cpf, nome, tipo, ...placas] = cols;
                const cli = new Professor(cpf, nome);
                for (const p of placas) if (p) cli.adicionarPlaca(p);
                cadastro.cadastrarCliente(cli);
            }
        }
    }

    // Grava o estado atual do gerenciador em memória de volta para o arquivo CSV
    static salvarClientes(caminhoArquivo, cadastro) {
        let linhasCSV = [];
        
        for (const cliente of cadastro.clientes.values()) {
            // Ajusta o valor da terceira coluna de acordo com a classe do cliente instanciado
            let infoEspecial = cliente.constructor.name === 'Professor' ? 'Professor' : 
                               cliente.constructor.name === 'Estudante' ? cliente.saldo : cliente.debitoAcumulado;
            
            let tipo = cliente.constructor.name;
            let placas = Array.from(cliente.placas).join(','); // Transforma o Set de placas em uma string
            
            linhasCSV.push(`${cliente.documento},${cliente.nome},${infoEspecial},${tipo},${placas}`);
        }
        fs.writeFileSync(caminhoArquivo, linhasCSV.join('\n'));
    }

    // Lê o histórico de estacionamento e restaura os tickets na memória
    static carregarTickets(caminhoArquivo, registro, cadastro) {
        if (!fs.existsSync(caminhoArquivo)) return;

        const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
        const linhas = conteudo.split(/\r?\n/).filter(l => l.trim().length > 0);

        for (const linha of linhas) {
            // Separa os dados respeitando a ordem das colunas do CSV
            const [placa, entradaStr, saidaStr, devidoStr, descontoStr, pagoStr] = linha.split(',');

            // Descobre quem é o dono do carro para associar a regra correta ao ticket
            let cliente = cadastro.buscarClientePorPlaca(placa);
            let tipoCliente = cliente ? cliente.constructor.name : "ClienteAvulso";
            const ticket = new TicketEstacionamento(placa, tipoCliente);
            ticket.dataEntrada = new Date(entradaStr);

            // Verifica se a string de saída existe. Se não existir, significa que o carro ainda está no estacionamento
            if (saidaStr) {
                ticket.dataSaida = new Date(saidaStr);
                ticket.valorDevido = Number(devidoStr);
                ticket.valorDesconto = Number(descontoStr);
                ticket.valorPago = Number(pagoStr);
            }
            registro.tickets.push(ticket);
        }
    }

    // Grava todos os registros de entrada e saída no arquivo CSV
    static salvarTickets(caminhoArquivo, registro) {
        let linhasCSV = [];

        for (const ticket of registro.tickets) {
            const entrada = ticket.dataEntrada.toISOString().substring(0, 19); 
        
            // Operadores ternários para lidar com carros que ainda não saíram. 
            // Se não houver dataSaida, deixa o campo vazio para gerar as vírgulas no final da linha do CSV.
            const saida = ticket.dataSaida ? ticket.dataSaida.toISOString().substring(0, 19) : '';
            const devido = ticket.dataSaida ? ticket.valorDevido : '';
            const desconto = ticket.dataSaida ? ticket.valorDesconto : '';
            const pago = ticket.dataSaida ? ticket.valorPago : '';

            linhasCSV.push(`${ticket.placa},${entrada},${saida},${devido},${desconto},${pago}`);
        }
        fs.writeFileSync(caminhoArquivo, linhasCSV.join('\n'));
    }
}
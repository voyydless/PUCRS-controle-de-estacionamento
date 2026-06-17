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
}
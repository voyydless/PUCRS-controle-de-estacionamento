import { TicketEstacionamento } from '../models/TicketEstacionamento.js';
import { ClienteAvulso } from '../models/ClienteAvulso.js';
import { Estudante } from '../models/Estudante.js';
import { Empresa } from '../models/Empresa.js';

class RegistroDeEntradas_E_Saidas {
    constructor(cadastroClientes) {
        this.cadastro = cadastroClientes;
        this.tickets = []; 
        this.listaBloqueioAvulsos = new Set(); // Para avulsos que recusam pagar
        this.clienteAvulsoSingleton = new ClienteAvulso();
    }

    autorizarEntrada(placa) {
        let cliente = this.cadastro.buscarClientePorPlaca(placa);
        let tipoCliente = "Avulso";

        if (cliente) {
            // Veículos pré-cadastrados nunca podem usar modalidade avulsa
            if (!cliente.podeEntrar(placa, this.tickets)) {
                console.log(`Entrada bloqueada para a placa ${placa}.`);
                return null;
            }
            tipoCliente = cliente.constructor.name;
        } else {
            if (!this.clienteAvulsoSingleton.podeEntrar(placa, this.listaBloqueioAvulsos)) {
                console.log(`Veículo bloqueado por inadimplência prévia.`);
                return null;
            }
        }

        const ticket = new TicketEstacionamento(placa, tipoCliente);
        this.tickets.push(ticket); // Cria registro contendo placa, tipo e data
        console.log("Entrada liberada."); // Libera a entrada
        return ticket;
    }

    processarSaida(placa, recusouPagar = false) {
        // Recuperar registro a partir da placa
        const ticket = this.tickets.find(t => t.placa === placa && !t.dataSaida);
        if (!ticket) throw new Error("Veículo não encontrado no estacionamento.");

        ticket.registrarSaida();
        let cliente = this.cadastro.buscarClientePorPlaca(placa) || this.clienteAvulsoSingleton;

        // Calcular o custo conforme o tipo de cliente (polimorfismo)
        ticket.valorDevido = cliente.calcularCusto(ticket);

        // Aplica Descontos (projetado para inclusão futura)
        if (cliente instanceof ClienteAvulso && this.verificarFrequencia(placa)) {
            ticket.idDesconto = "ClienteFrequente"; // Identificado pela string
            ticket.valorDesconto = ticket.valorDevido * 0.20; // 20% de desconto
        }

        const totalAPagar = ticket.valorDevido - ticket.valorDesconto;

        if (cliente instanceof Estudante) {
            cliente.processarPagamento(totalAPagar);
            ticket.valorPago = totalAPagar; 
        } else if (cliente instanceof Empresa) {
            cliente.debitoAcumulado += totalAPagar;
            ticket.valorPago = 0; // Pago via boleto futuramente
        } else if (cliente instanceof ClienteAvulso) {
            if (recusouPagar) {
                this.listaBloqueioAvulsos.add(placa); // Registrado em lista de bloqueio
                ticket.valorPago = 0;
            } else {
                ticket.valorPago = totalAPagar;
            }
        }

        console.log(`Saída processada. Total: R$${totalAPagar}`); // Liberar a saída
        return ticket;
    }

    verificarFrequencia(placa) {
        // Regra do cliente frequente: 3 vezes nos últimos 5 dias
        const cincoDiasAtras = new Date();
        cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5);
        
        const acessos = this.tickets.filter(t => t.placa === placa && t.dataEntrada >= cincoDiasAtras);
        return acessos.length >= 3;
    }
}

export { RegistroDeEntradas_E_Saidas };
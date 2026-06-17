class TicketEstacionamento {
    constructor(placa, tipoCliente) {
        this.placa = placa;
        this.tipoCliente = tipoCliente;
        this.dataEntrada = new Date(); // Registra data e hora de entrada
        this.dataSaida = null;
        this.valorDevido = 0;
        this.valorDesconto = 0;
        this.idDesconto = "nenhum";
        this.valorPago = 0;
    }

    registrarSaida() {
        this.dataSaida = new Date(); // Registra data e hora de saída
    }

    calcularHorasEstacionadas() {
        if (!this.dataSaida) return 0;
        const diffMs = this.dataSaida - this.dataEntrada;
        return Math.ceil(diffMs / (1000 * 60 * 60)); 
    }

    calcularDiasEstacionados() {
        if (!this.dataSaida) return 0;
        // Calcula quantas vezes a meia noite foi cruzada
        const entradaFormatada = new Date(this.dataEntrada.getFullYear(), this.dataEntrada.getMonth(), this.dataEntrada.getDate());
        const saidaFormatada = new Date(this.dataSaida.getFullYear(), this.dataSaida.getMonth(), this.dataSaida.getDate());
        const diffDias = (saidaFormatada - entradaFormatada) / (1000 * 60 * 60 * 24);
        return diffDias;
    }
}

export { TicketEstacionamento };

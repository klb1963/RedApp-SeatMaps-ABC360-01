// file: UpdatePNR.tsx

import * as React from "react";
import { Button, Modal, Alert } from "react-bootstrap";
import { getService } from "../../Context";

import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

import { ISoapApiService } from "sabre-ngv-communication/interfaces/ISoapApiService";
import { PnrPublicService } from "sabre-ngv-app/app/services/impl/PnrPublicService";

interface UpdatePNRProps {
  passengerRef: string; // например: "1.1"
  seatNumber: string;   // например: "16C"
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureDate: string; // формат YYYY-MM-DD
  amount?: string;           // например "21.00"
  currency?: string;         // например "EUR"
  passengerName?: string;    // например "PETROV/ALEX"
}

export class UpdatePNR extends React.Component<UpdatePNRProps, { status: 'idle' | 'success' | 'error' }> {
    constructor(props) {
      super(props);
      this.state = { status: 'idle' };
  
      this.assignSeat = this.assignSeat.bind(this);
      this.handleClose = this.handleClose.bind(this);
    }
  
    assignSeat() {
        const soap = getService(ISoapApiService);
      
        const passengerRef = this.props.passengerRef;
        const seatNumber = this.props.seatNumber;
        const flightNumber = this.props.flightNumber || '0000';
        const airlineCode = this.props.airlineCode || 'XX';
        const origin = this.props.origin || 'XXX';
        const destination = this.props.destination || 'YYY';
        const departureDate = this.props.departureDate || '2025-01-01';
      
        const xml = `
          <SeatAssignmentRQ xmlns="http://services.sabre.com/STL/v01" version="1.0.0">
              <SeatAssignmentInfo>
              <FlightSegment
                  flightNumber="${flightNumber}"
                  airlineCode="${airlineCode}"
                  origin="${origin}"
                  destination="${destination}"
                  departureDate="${departureDate}" />
              <Passenger id="${passengerRef}" nameNumber="${passengerRef}" />
              <Seats>
                  <Seat>
                  <Number>${seatNumber}</Number>
                  </Seat>
              </Seats>
              </SeatAssignmentInfo>
          </SeatAssignmentRQ>`;
      
        soap.callSws({ action: 'SeatAssignmentRQ', payload: xml, authTokenType: 'SESSION' })
          .then((res) => {
            console.log('✅ Seat assignment result (full XML):');
            console.log(res.value);
            this.setState({ status: 'success' });
            getService(PnrPublicService).refreshData();
          })
          .catch((err) => {
            console.error('❌ Seat assignment error (details):', err);
            this.setState({ status: 'error' });
          });
      }
  
    handleClose() {
        getService(PublicModalsService).closeReactModal();
    }
  
    render() {
      const { seatNumber, passengerName } = this.props;
  
      if (this.state.status === 'success') {
        return (
          <Alert bsStyle="success" onDismiss={this.handleClose}>
            <h4>✅ Место назначено</h4>
            <p>Пассажир {passengerName} назначен на место {seatNumber}</p>
            <Button bsStyle="success" onClick={this.handleClose}>Закрыть</Button>
          </Alert>
        );
      }
  
      if (this.state.status === 'error') {
        return (
          <Alert bsStyle="danger" onDismiss={this.handleClose}>
            <h4>Ошибка</h4>
            <p>Не удалось назначить место. Попробуйте снова.</p>
            <Button onClick={this.assignSeat}>Повторить</Button>
            <Button onClick={this.handleClose}>Отмена</Button>
          </Alert>
        );
      }
  
      return (
        <Modal.Dialog className="react-modal">
          <Modal.Header closeButton onHide={this.handleClose}>
            <Modal.Title>Подтверждение назначения</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Назначить место <strong>{seatNumber}</strong> пассажиру <strong>{passengerName}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Отмена</Button>
            <Button bsStyle="primary" onClick={this.assignSeat}>Назначить</Button>
          </Modal.Footer>
        </Modal.Dialog>
      );
    }
  }
// файл: code/components/EnhancedSeatMapRequest.tsx

import * as React from 'react';
import { Button, FormGroup, ControlLabel } from 'react-bootstrap';
import { SimpleDropdown } from 'sabre-ngv-UIComponents/advancedDropdown/components/SimpleDropdown';
import { Option } from 'sabre-ngv-UIComponents/advancedDropdown/interfaces/Option';
import { getService } from '../Context';
import { loadPnrDetailsFromSabre } from './loadPnrDetailsFromSabre';
import { loadSeatMapFromSabre } from './loadSeatMapFromSabre';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { XmlViewer } from '../utils/XmlViewer';

interface Passenger {
    travellerId: number;
    givenName: string;
    surname: string;
}

interface SegmentOption {
    label: string;
    value: string;
    origin: string;
    destination: string;
    departureDate: string;
    marketingCarrier: string;
    marketingFlightNumber: string;
    bookingClass: string;
    cabin?: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
}

interface EnhancedSeatMapRequestState {
    segments: SegmentOption[];
    selectedSegment: string;
    passengers: Passenger[];
    xmlResponse: string | null;
    loading: boolean;
    error: string | null;
}

export class EnhancedSeatMapRequest extends React.Component<Record<string, unknown>, EnhancedSeatMapRequestState> {
    constructor(props: Record<string, unknown>) {
        super(props);
        this.state = {
            segments: [],
            selectedSegment: '',
            passengers: [],
            xmlResponse: null,
            loading: false,
            error: null
        };
    }

    componentDidMount(): void {
        this.loadPnr();
    }

    loadPnr(): void {
        loadPnrDetailsFromSabre((pnrData) => {
            if (!pnrData || !pnrData.segments.length) {
                this.setState({ error: '❌ No active PNR found. Please create or retrieve a PNR first.' });
                return;
            }

            const segments = pnrData.segments.map(seg => ({
                label: `${seg.origin} → ${seg.destination} (${seg.marketingCarrier}${seg.marketingFlightNumber}) - ${seg.departureDate}`,
                value: seg.value,
                ...seg
            }));

            const passengers = pnrData.passengers.map(p => ({
                travellerId: Number(p.value),
                givenName: p.givenName,
                surname: p.surname
            }));

            this.setState({
                segments,
                selectedSegment: segments.length === 1 ? segments[0].value : '',
                passengers,
                error: null
            });
        });
    }

    handleSegmentChange = (options: Option[]): void => {
        const selected = options.find(opt => opt.checked);
        if (selected) {
            this.setState({ selectedSegment: selected.value });
        }
    };

    requestSeatMap = async (): Promise<void> => {
        const { selectedSegment, segments, passengers } = this.state;
        if (!selectedSegment) {
            console.warn('No segment selected.');
            return;
        }

        const segment = segments.find(seg => seg.value === selectedSegment);
        if (!segment) {
            console.warn('Selected segment not found.');
            return;
        }

        const flightSegment = {
            origin: segment.origin,
            destination: segment.destination,
            departureDate: segment.departureDate,
            marketingCarrier: segment.marketingCarrier,
            marketingFlightNumber: segment.marketingFlightNumber,
            flightNumber: segment.marketingFlightNumber,
            bookingClass: segment.bookingClass || 'Y',
            cabin: segment.cabin || 'Economy'
        };

        try {
            this.setState({ loading: true });
            await loadSeatMapFromSabre(flightSegment, passengers, (parsed, rawXml) => {
                if (rawXml) {
                    this.setState({ xmlResponse: rawXml, loading: false });
                } else {
                    this.setState({ xmlResponse: '<?xml version="1.0"?><error>No response</error>', loading: false });
                }
            });
        } catch (error) {
            console.error('Error loading seat map:', error);
            this.setState({ loading: false });
        }
    };

    render(): JSX.Element {
        const { segments, selectedSegment, xmlResponse, loading, error } = this.state;

        if (error) {
            return (
                <div style={{ padding: '20px', color: 'red', fontWeight: 'bold' }}>
                    {error}
                </div>
            );
        }

        return (
            <div style={{ padding: '20px', minWidth: '500px' }}>
                <FormGroup>
                    <ControlLabel>Select Flight Segment</ControlLabel>
                    <SimpleDropdown
                        options={segments.map(seg => ({
                            label: seg.label,
                            value: seg.value,
                            checked: seg.value === selectedSegment
                        }))}
                        onChange={this.handleSegmentChange}
                    />
                </FormGroup>

                <Button
                    className="btn-primary"
                    style={{ marginTop: '15px' }}
                    disabled={!selectedSegment || loading}
                    onClick={this.requestSeatMap}
                >
                    {loading ? 'Loading...' : 'Get EnhancedSeatMapRQ'}
                </Button>

                {xmlResponse && <XmlViewer xml={xmlResponse} />}

            </div>
        );
    }
}
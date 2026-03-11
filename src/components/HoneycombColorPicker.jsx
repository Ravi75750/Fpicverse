import React, { useState } from 'react';
import styled from 'styled-components';
import { Check, X } from 'lucide-react';

const Container = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  width: 320px;
  z-index: 50;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const HoneycombGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 1.5rem;
  user-select: none;
`;

const Row = styled.div`
  display: flex;
  gap: 2px;
  margin-left: ${props => props.$offset ? '11px' : '0'};
`;

const HexCell = styled.div`
  width: 20px;
  height: 23px;
  background-color: ${props => props.color};
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    transform: scale(1.2);
    z-index: 10;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
  }

  ${props => props.$active && `
    transform: scale(1.2);
    z-index: 10;
    box-shadow: 0 0 0 2px white, 0 0 0 4px #3b82f6;
  `}
`;

const InputSection = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const HexInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px #3b82f620;
  }
`;

const ApplyButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: #2563eb;
  }
`;

// Comprehensive 127-color honeycomb set (simplified rows for better UI fit)
const generateHoneycombColors = () => {
  return [
    ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999'],
    ['#FF0000', '#E60000', '#CC0000', '#B30000', '#990000', '#800000', '#660000', '#4D0000'],
    ['#00FF00', '#00E600', '#00CC00', '#00B300', '#009900', '#008000', '#006600', '#004D00', '#003300'],
    ['#0000FF', '#0000E6', '#0000CC', '#0000B3', '#000099', '#000080', '#000066', '#00004D', '#000033', '#00001A'],
    ['#FFFF00', '#E6E600', '#CCCC00', '#B3B300', '#999900', '#808000', '#666600', '#4D4D00', '#333300', '#FFFF33', '#FFFF66'],
    ['#FF00FF', '#E600E6', '#CC00CC', '#B300B3', '#990099', '#800080', '#660066', '#4D004D', '#330033', '#FF33FF'],
    ['#00FFFF', '#00E6E6', '#00CCCC', '#00B3B3', '#009999', '#008080', '#006666', '#004D4D', '#003333'],
    ['#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500', '#FF0000', '#DC143C', '#B22222'],
    ['#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0', '#C0C0C0', '#B0B0B0', '#A0A0A0'],
  ];
};

const HoneycombColorPicker = ({ onSelect, onClose }) => {
  const [hex, setHex] = useState('');
  const rows = generateHoneycombColors();

  const handleHexSubmit = (e) => {
    e.preventDefault();
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onSelect(hex);
    }
  };

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      <Header>
        <Title>Pick a Color:</Title>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </Header>

      <HoneycombGrid>
        {rows.map((row, i) => (
          <Row key={i} $offset={i % 2 !== 0}>
            {row.map((color, j) => (
              <HexCell
                key={j}
                color={color}
                onClick={() => {
                  setHex(color);
                  onSelect(color);
                }}
                $active={hex.toLowerCase() === color.toLowerCase()}
              />
            ))}
          </Row>
        ))}
      </HoneycombGrid>

      <form onSubmit={handleHexSubmit}>
        <InputSection>
          <div
            className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0"
            style={{ backgroundColor: hex || '#ffffff' }}
          />
          <HexInput
            placeholder="#FFFFFF"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
          />
          <ApplyButton type="submit">
            <Check className="h-4 w-4" />
          </ApplyButton>
        </InputSection>
      </form>
    </Container>
  );
};

export default HoneycombColorPicker;

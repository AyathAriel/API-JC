import React from 'react';
import { 
  Box, 
  Tooltip, 
  Badge, 
  IconButton, 
  Divider,
  styled
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import GetAppIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
import { FaSpinner } from 'react-icons/fa';

// Define styled components for the action buttons
const ActionButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.3s ease',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: 'rgba(0, 0, 0, 0.26)',
    boxShadow: 'none',
  }
}));

// StatusBadge styled component for better styling
const StatusBadge = styled(Badge)<{ customcolor: string }>(({ theme, customcolor }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: customcolor,
    color: 'white',
    fontSize: '0.75rem',
    height: '22px',
    minWidth: '80px',
    borderRadius: '12px',
    textTransform: 'capitalize',
    fontWeight: 'medium',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
}));

interface DetalleSolicitudActionsProps {
  estado: string;
  estadoDisplay?: string;
  isDownloading: boolean;
  onPrint: () => void;
  onDownload: () => void;
  onEdit: () => void;
}

const DetalleSolicitudActions: React.FC<DetalleSolicitudActionsProps> = ({
  estado,
  estadoDisplay,
  isDownloading,
  onPrint,
  onDownload,
  onEdit
}) => {
  // Determine color based on status
  const getStatusColor = (): string => {
    switch (estado) {
      case 'aprobado':
        return '#10b981'; // verde
      case 'rechazado':
        return '#ef4444'; // rojo
      default:
        return '#f59e0b'; // amarillo
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={estadoDisplay || estado} arrow placement="top">
        <StatusBadge 
          customcolor={getStatusColor()}
          badgeContent={estadoDisplay || estado}
        >
          <Box component="span" sx={{ width: 4 }} />
        </StatusBadge>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 2, height: '28px' }} />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Imprimir solicitud" arrow placement="top">
          <ActionButton
            onClick={onPrint}
            disabled={isDownloading}
            sx={{ 
              bgcolor: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              '&:hover': {
                bgcolor: 'rgba(79, 70, 229, 0.15)',
              },
            }}
            size="small"
            aria-label="Imprimir solicitud"
          >
            {isDownloading ? <FaSpinner className="animate-spin" /> : <PrintIcon fontSize="small" />}
          </ActionButton>
        </Tooltip>
        
        <Tooltip title="Descargar documentos" arrow placement="top">
          <ActionButton
            onClick={onDownload}
            disabled={isDownloading}
            sx={{ 
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              '&:hover': {
                bgcolor: 'rgba(37, 99, 235, 0.15)',
              },
            }}
            size="small"
            aria-label="Descargar documentos"
          >
            {isDownloading ? <FaSpinner className="animate-spin" /> : <GetAppIcon fontSize="small" />}
          </ActionButton>
        </Tooltip>
        
        <Tooltip title="Editar solicitud" arrow placement="top">
          <ActionButton
            onClick={onEdit}
            disabled={isDownloading}
            sx={{ 
              bgcolor: 'rgba(217, 119, 6, 0.1)',
              color: '#d97706',
              '&:hover': {
                bgcolor: 'rgba(217, 119, 6, 0.15)',
              },
            }}
            size="small"
            aria-label="Editar solicitud"
          >
            <EditIcon fontSize="small" />
          </ActionButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default DetalleSolicitudActions; 
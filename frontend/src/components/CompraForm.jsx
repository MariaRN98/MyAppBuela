import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './CompraForm.css';

const CompraForm = ({ editMode }) => {
  const { dependienteId, compraId } = useParams();
  const [formData, setFormData] = useState({
    producto: '',
    cantidad: 1,
    precio_aprx_unid: '',
    tienda: '',
    comprado: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (editMode) {
      const fetchCompra = async () => {
        try {
          const response = await api.get(`/api/dependientes/${dependienteId}/compras/${compraId}/`);
          setFormData(response.data);
        } catch (err) {
          setError('Error al cargar los datos del artículo');
        }
      };
      fetchCompra();
    }
  }, [dependienteId, compraId, editMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/api/dependientes/${dependienteId}/compras/${compraId}/`, formData);
      } else {
        await api.post(`/api/dependientes/${dependienteId}/compras/crear/`, {
          ...formData,
          dependiente: dependienteId
        });
      }
      navigate(`/dependientes/${dependienteId}/compras`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el artículo');
    }
  };

  return (
    <div className="compra-form-container">
      <h2><FaShoppingCart /> {editMode ? 'Editar Artículo' : 'Añadir Artículo'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Producto:</label>
          <input
            type="text"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Cantidad:</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Precio por unidad (€):</label>
            <input
              type="number"
              name="precio_aprx_unid"
              value={formData.precio_aprx_unid}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Tienda:</label>
          <input
            type="text"
            name="tienda"
            value={formData.tienda}
            onChange={handleChange}
          />
        </div>
        
        {editMode && (
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                name="comprado"
                checked={formData.comprado}
                onChange={handleChange}
              />
              ¿Ya comprado?
            </label>
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            <FaSave /> {editMode ? 'Actualizar' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/dependientes/${dependienteId}/compras`)}
          >
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompraForm;
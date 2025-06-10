import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaShoppingCart, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import './ListaCompras.css';

const ListaCompras = () => {
  const { dependienteId } = useParams();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/compras/`);
        setCompras(response.data);

        // Verifica rol del usuario
        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasEditAccess = userAccess.some(
          access =>
            access.dependienteId === parseInt(dependienteId) &&
            (access.rol === 'Admin' || access.rol === 'Editor')
        );
        setCanEdit(hasEditAccess);
      } catch (err) {
        setError('Error al cargar la lista de compras');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, [dependienteId]);

  const handleToggleComprado = async (compraId) => {
    try {
      const compra = compras.find(c => c.id === compraId);
      const updatedCompra = { ...compra, comprado: !compra.comprado };
      
      await api.put(`/api/dependientes/${dependienteId}/compras/${compraId}/`, updatedCompra);
      setCompras(compras.map(c => c.id === compraId ? updatedCompra : c));
    } catch (err) {
      setError('Error al actualizar el estado');
    }
  };

  const handleDelete = async (compraId) => {
    if (window.confirm('¿Eliminar este artículo de la lista?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/compras/${compraId}/`);
        setCompras(compras.filter(c => c.id !== compraId));
      } catch (err) {
        setError('Error al eliminar el artículo');
      }
    }
  };

  if (loading) return <div className="loading">Cargando lista de compras...</div>;
  if (error) return <div className="error">{error}</div>;

  // return (
  //   <div className="lista-compras-container">
  //     <div className="header-compras">
  //       <h2><FaShoppingCart /> Lista de Compras</h2>
  //       {canEdit && (
  //         <button 
  //           onClick={() => navigate(`/dependientes/${dependienteId}/compras/crear`)}
  //           className="btn-add"
  //         >
  //           <FaPlus /> Añadir Artículo
  //         </button>
  //       )}
  //     </div>

  //     <div className="filtros">
  //       <button onClick={() => setCompras([...compras].sort((a, b) => a.comprado - b.comprado))}>
  //         Ordenar por estado
  //       </button>
  //       <button onClick={() => setCompras([...compras].sort((a, b) => a.producto.localeCompare(b.producto)))}>
  //         Ordenar por nombre
  //       </button>
  //     </div>

  //     <ul className="lista-items">
  //       {compras.length === 0 ? (
  //         <p className="no-items">No hay artículos en la lista</p>
  //       ) : (
  //         compras.map((compra) => (
  //           <li key={compra.id} className={`item-compra ${compra.comprado ? 'comprado' : ''}`}>
  //             <div className="item-info">
  //               <span 
  //                 className="check-comprado"
  //                 onClick={() => handleToggleComprado(compra.id)}
  //               >
  //                 {compra.comprado ? <FaCheck className="icon-check" /> : <div className="check-box" />}
  //               </span>
  //               <div className="producto-details">
  //                 <h3>{compra.producto}</h3>
  //                 <p>{compra.tienda} • Cantidad: {compra.cantidad}</p>
  //                 <p className="precio">Precio aprox.: {compra.precio_aprx_unid ? `${compra.precio_aprx_unid}€/unidad` : 'No especificado'}</p>
  //               </div>
  //             </div>
  //             {canEdit && (
  //               <div className="item-actions">
  //                 <button 
  //                   onClick={() => navigate(`/dependientes/${dependienteId}/compras/${compra.id}/editar`)}
  //                   className="btn-edit"
  //                 >
  //                   <FaEdit />
  //                 </button>
  //                 <button 
  //                   onClick={() => handleDelete(compra.id)}
  //                   className="btn-delete"
  //                 >
  //                   <FaTrash />
  //                 </button>
  //               </div>
  //             )}
  //           </li>
  //         ))
  //       )}
  //     </ul>
  //   </div>
  // );

  return (
  <div className="lista-compras-container">
    <div className="header-compras">
      <h2><FaShoppingCart /> Lista de Compras</h2>
    </div>

    <div className="filtros">
      <button onClick={() => setCompras([...compras].sort((a, b) => a.comprado - b.comprado))}>
        Ordenar por estado
      </button>
      <button onClick={() => setCompras([...compras].sort((a, b) => a.producto.localeCompare(b.producto)))}>
        Ordenar por nombre
      </button>
    </div>

    <ul className="lista-items">
      {compras.length === 0 ? (
        <p className="no-items">No hay artículos en la lista</p>
      ) : (
        compras.map((compra) => (
          <li key={compra.id} className={`item-compra ${compra.comprado ? 'comprado' : ''}`}>
            <div className="item-info">
              <span 
                className="check-comprado"
                onClick={() => handleToggleComprado(compra.id)}
              >
                {compra.comprado ? <FaCheck className="icon-check" /> : <div className="check-box" />}
              </span>
              <div className="producto-details">
                <h3>{compra.producto}</h3>
                <p>{compra.tienda} • Cantidad: {compra.cantidad}</p>
                <p className="precio">Precio aprox.: {compra.precio_aprx_unid ? `${compra.precio_aprx_unid}€/unidad` : 'No especificado'}</p>
              </div>
            </div>
            {canEdit && (
              <div className="item-actions">
                <button 
                  onClick={() => navigate(`/dependientes/${dependienteId}/compras/${compra.id}/editar`)}
                  className="btn-edit"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete(compra.id)}
                  className="btn-delete"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </li>
        ))
      )}
    </ul>

    {canEdit && (
      <button 
        onClick={() => navigate(`/dependientes/${dependienteId}/compras/crear`)}
        className="btn-add-floating"
      >
        <FaPlus />
      </button>
    )}
  </div>
);
};

export default ListaCompras;
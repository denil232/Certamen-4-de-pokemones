import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const traduccionTipos = {
  normal: 'normal',
  fighting: 'lucha',
  flying: 'volador',
  poison: 'veneno',
  ground: 'tierra',
  rock: 'roca',
  bug: 'bicho',
  ghost: 'fantasma',
  steel: 'acero',
  fire: 'fuego',
  water: 'agua',
  grass: 'planta',
  electric: 'eléctrico',
  psychic: 'psíquico',
  ice: 'hielo',
  dragon: 'dragón',
  dark: 'siniestro',
  fairy: 'hada'
};

const PokemonFetcher = () => {
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(20);
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();
        setTipos(data.results);
      } catch (err) {
        setError('No se pudieron cargar los tipos.');
      }
    };
    fetchTipos();
  }, []);

  const buscarPorTipo = async () => {
    if (!tipoSeleccionado) return;

    setCargando(true);
    setError(null);
    setPokemones([]);

    if (tipoSeleccionado === 'aleatorio') {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008');
        const data = await res.json();

        const seleccionados = [];
        const usados = new Set();

        while (seleccionados.length < cantidad) {
          const index = Math.floor(Math.random() * data.results.length);
          if (!usados.has(index)) {
            usados.add(index);
            seleccionados.push(data.results[index]);
          }
        }

        const detalles = await Promise.all(
          seleccionados.map(async (p) => {
            const res = await fetch(p.url);
            const info = await res.json();
            return {
              id: info.id,
              nombre: info.name,
              imagen: info.sprites.front_default,
              tipos: info.types.map((t) => t.type.name),
            };
          })
        );

        setPokemones(detalles);
      } catch (err) {
        setError('Error al buscar Pokémon aleatorios.');
      } finally {
        setCargando(false);
      }

      return; // Finalizar aquí para que no continúe con lógica de tipo específico
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${tipoSeleccionado}`);
      if (!response.ok) {
        throw new Error(`Tipo no encontrado: ${tipoSeleccionado}`);
      }

      const data = await response.json();
      const primeros = data.pokemon.slice(0, Math.min(120, cantidad));

      const detalles = await Promise.all(
        primeros.map(async (p) => {
          const res = await fetch(p.pokemon.url);
          const info = await res.json();
          return {
            id: info.id,
            nombre: info.name,
            imagen: info.sprites.front_default,
            tipos: info.types.map(t => t.type.name),
          };
        })
      );

      setPokemones(detalles);
    } catch (err) {
      setError('Error al buscar los Pokémon.');
    } finally {
      setCargando(false);
    }
  };

  const tipoClase = tipoSeleccionado && tipoSeleccionado !== 'aleatorio'
    ? traduccionTipos[tipoSeleccionado] || ''
    : '';

  return (
    <div className={`pokemon-container ${tipoClase ? `tipo-${tipoClase}` : ''}`}>
      <h2>Buscar Pokémon por Tipo</h2>

      <div className="form-group">
        <label>Tipo:</label>
        <select
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(e.target.value)}
        >
          <option value="">Selecciona un tipo</option>
          <option value="aleatorio">🌟 Aleatorio</option>
          {tipos.map((tipo) => (
            <option key={tipo.name} value={tipo.name}>
              {traduccionTipos[tipo.name]
                ? traduccionTipos[tipo.name].charAt(0).toUpperCase() + traduccionTipos[tipo.name].slice(1)
                : tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Cantidad (máx. 120):</label>
        <input
          type="number"
          value={cantidad}
          min="1"
          max="120"
          onChange={(e) => setCantidad(Number(e.target.value))}
        />
      </div>

      <button onClick={buscarPorTipo} disabled={!tipoSeleccionado}>
        Buscar
      </button>

      {cargando && <p>Cargando Pokémon...</p>}
      {error && <p className="error">{error}</p>}

      <div className="pokemon-list">
        {pokemones.map((pokemon) => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p>
              <strong>Tipos:</strong> {pokemon.tipos.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonFetcher;

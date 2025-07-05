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
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todos los tipos de Pokémon al montar
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

  // Buscar Pokémon por tipo
  const buscarPorTipo = async () => {
    if (!tipoSeleccionado) return;

    setCargando(true);
    setError(null);
    setPokemones([]);

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${tipoSeleccionado}`);
      if (!response.ok) {
        throw new Error(`Tipo no encontrado: ${tipoSeleccionado}`);
      }

      const data = await response.json();
      const primeros = data.pokemon.slice(0, 120); // Solo los primeros 120

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

  // Obtenemos la clase CSS basada en la traducción del tipo seleccionado
  const tipoClase = tipoSeleccionado ? traduccionTipos[tipoSeleccionado] || '' : '';

  return (
    <div className={`pokemon-container ${tipoClase ? `tipo-${tipoClase}` : ''}`}>
      <h2>Buscar Pokémon por Tipo</h2>

      <select
        value={tipoSeleccionado}
        onChange={(e) => setTipoSeleccionado(e.target.value)}
      >
        <option value="">Selecciona un tipo</option>
        {tipos.map((tipo) => (
          <option key={tipo.name} value={tipo.name}>
            {traduccionTipos[tipo.name]
              ? traduccionTipos[tipo.name].charAt(0).toUpperCase() + traduccionTipos[tipo.name].slice(1)
              : tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1)}
          </option>
        ))}
      </select>

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

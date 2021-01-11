import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Spinner from './img/Spinner.gif';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';


function App() {
	const [searchQuery, setSearchQuery] = useState();
	const [movies, setMovies] = useState([]);
	const [nominations, setNomination] = useState([]);
	const [loading, setLoading] = useState(false);
	const baseUrl = `http://www.omdbapi.com/?s=${searchQuery}&apikey=6ccf3a20`;

	const notify = () => toast.info("Nomination Completed");
	useEffect(() => {
		const savedNominations = JSON.parse(localStorage.getItem('nominations'));
		setNomination(savedNominations);
	}, []);


	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		const response = await fetch(baseUrl);
		const data = await response.json();
		setMovies(data.Search);
		setLoading(false);
	}

	const handleNominate = (movie) => {
		if (nominations.length === 5) {
			notify()
			return
		};	
		if (nominations.length > 3) {
			notify()
		};
		if (!nominations.filter((i) => i.imdbID === movie.imdbID).length)
			setNomination([...nominations, movie]);
		localStorage.setItem(
			'nominations',
			JSON.stringify([...nominations, movie])
		);
	};

	const handleUnNominate = (movie) => {
		const filteredNominations = nominations.filter(
			(i) => i.imdbID !== movie.imdbID
		);
		setNomination(filteredNominations);
		localStorage.setItem('nominations', JSON.stringify(filteredNominations));
	};


	return (
		<>
		<ToastContainer hideProgressBar />
		<div className='container'>
			<div className='search'>
				<h2 className='title'>The Shoppies</h2>
				<form onSubmit={handleSubmit} className='header-input'>
					<input
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder='Search'
						type='text'
						value={searchQuery}
					/>
					<div className='search-btn'>
						<SearchIcon onClick={handleSubmit} className='header-button' />
					</div>
				</form>
			</div>
			{movies.length ? <p>Result for "{searchQuery}"</p> : null}
			<div className='body-container'>
				<div className='movies-container'>
					{movies.length ?
						movies.map((movie) => {
							const { Title, Year, Poster, imdbID } = movie;
							return (
								<div key={imdbID} className='movie'>
									<img className='poster' src={Poster} alt='poster' />
									<div className='movie-info'>
										<h3>{Title}</h3>
										<p>{Year}</p>
									</div>
									<Button
									color="secondary"
									disabled={
										nominations.filter((i) => i.imdbID === imdbID).length
									}
									onClick={() => handleNominate(movie)}
									 disableElevation>
									Nominate
								</Button>
								</div>
							);
						}): <p>Use the search button to find movies</p>}
						{loading && <img src={Spinner} alt="spinner"/>}
					{/* {!nominations.length && (
						<p>
							You currently, have'nt made a nomination, search your favourite movies,
							to start adding nominations
						</p>
					)} */}
				</div>
				<div className='nominations'>
					<p>
						You have nominated {nominations.length} movies,{' '}
						{5 - nominations.length} left
					</p>
					{nominations.length > 0 &&
						nominations.map((i) => (
							<div className='nominee'>
								<p>
									{i.Title} -{i.Year}{' '}
								</p>
								<Button color="secondary" disableElevation onClick={() => handleUnNominate(i)}>
									Remove
								</Button>
							</div>
						))}
				</div>
			</div>
		</div>
		</>
	);
}

export default App;

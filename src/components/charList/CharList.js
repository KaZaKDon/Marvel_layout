import { Component } from 'react';
import PropTypes from 'prop-types';

import './charList.scss';
import MarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import abyss from '../../resources/img/abyss.jpg';

class CharList extends Component {
    state = {
        chars: [],
        loading: true,
        error: false,
        offset: 210,
        newItemLoading: false,
        charEnded: false
    };

    marvelService = new MarvelService();
    itemsRefs = [];

    componentDidMount() {
        this.onRequest();
    }

    onRequest = (offset) => {
        this.setState({ loading: true, error: false });
        this.onCharListLoading();

        this.marvelService
            .getAllCharacters(offset)
            .then(this.onCharsLoaded)
            .catch(this.onError);
    }

    onCharListLoading = () => {
        this.setState({ newItemLoading: true });
    }

    onCharsLoaded = (newChars) => {
        let ended = false;
        if (newChars.length < 9) {
            ended = true;
        }

        this.setState(({ chars, offset }) => ({
            chars: [...chars, ...newChars],
            loading: false,
            newItemLoading: false,
            offset: offset + 9,
            charEnded: ended
        }));
    }

    onError = () => {
        this.setState({ loading: false, error: true });
    }

    // 🔹 Управление выделением и фокусом
    focusOnItem = (i) => {
        this.itemsRefs.forEach(item => item.classList.remove('char__item_selected'));
        this.itemsRefs[i].classList.add('char__item_selected');
        this.itemsRefs[i].focus();
    };

    renderItems(arr) {
        this.itemsRefs = [];

        const items = arr.map((item, i) => {
            const imgStyle = item.imageAvailable ? { objectFit: 'cover' } : { objectFit: 'contain' };

            return (
                <li
                    className="char__item"
                    key={item.id}
                    tabIndex={0}
                    ref={(el) => (this.itemsRefs[i] = el)}
                    onClick={() => {
                        this.props.onCharSelected(item.id);
                        this.focusOnItem(i);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                            this.props.onCharSelected(item.id);
                            this.focusOnItem(i);
                        }
                    }}
                >
                    <img src={item.thumbnail || abyss} alt={item.name} style={imgStyle}/>
                    <div className="char__name">{item.name}</div>
                </li>
            );
        });

        return <ul className="char__grid">{items}</ul>;
    }

    render() {
        const { chars, loading, error, newItemLoading, offset, charEnded } = this.state;

        const errorMessage = error ? <ErrorMessage /> : null;
        const spinner = loading ? <Spinner /> : null;
        const content = !(loading || error) ? this.renderItems(chars) : null;

        return (
            <div className="char__list">
                {errorMessage}
                {spinner}
                {content}
                <button
                    className="button button__main button__long"
                    disabled={newItemLoading}
                    style={{ display: charEnded ? 'none' : 'block' }}
                    onClick={() => this.onRequest(offset)}
                >
                    <div className="inner">load more</div>
                </button>
            </div>
        );
    }
}

CharList.propTypes = {
    onCharSelected: PropTypes.func.isRequired
};

CharList.defaultProps = {
    onCharSelected: () => {}
};

export default CharList;
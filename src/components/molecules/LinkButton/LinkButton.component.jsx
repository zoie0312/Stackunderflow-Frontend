import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';

import './LinkButton.styles.scss';

const LinkButton = ({text, link, type, handleClick, marginTop, isDisabled}) => {
  return (
    <Fragment>
      <Link 
        onClick={handleClick} 
        to={isDisabled ? '#' : link} 
      >
        <button 
          className={`s-btn ${type}`} 
          style={{marginTop}} 
          disabled={isDisabled}
        >
          {text}
        </button>
      </Link>
    </Fragment>
  );
};

export default LinkButton;

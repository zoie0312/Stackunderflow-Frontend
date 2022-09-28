import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';

import './LinkButton.styles.scss';

const LinkButton = ({text, link, type, handleClick, marginTop, isDisabled}) => {
  return (
    <Fragment>
      <Link onClick={handleClick} to={isDisabled ? '#' : link} className={isDisabled ? 'disabled-link' : ''}>
        <button className={`s-btn ${type}`} style={{marginTop}} disabled={isDisabled} title='Please connect wallet'>
          {text}
        </button>
      </Link>
    </Fragment>
  );
};

export default LinkButton;

import React, { Fragment, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { chain } from "wagmi";

import { logout } from "../../../redux/auth/auth.actions";
import { walletLogin, walletLogout } from "../../../redux/auth/auth.actions";
import getDisplayAddress from "../../../utils/getDisplayAddress";

import { ReactComponent as Search } from "../../../assets/Search.svg";
import { ReactComponent as Logo } from "../../../assets/LogoMd.svg";
import { ReactComponent as SmallLogo } from "../../../assets/LogoGlyphMd.svg";
import Spinner from "../../molecules/Spinner/Spinner.component";
import LinkButton from "../../molecules/LinkButton/LinkButton.component";
import MobileSideBar from "../../organisms/MobileSideBar/MobileSideBar.component";

import "./Header.styles.scss";

const connector = new MetaMaskConnector({
    chains: [chain.mainnet, chain.optimism, chain.goerli],
});

const Header = ({
    auth: { isAuthenticated, loading, user },
    logout,
    walletLogin,
    walletLogout,
}) => {
    let history = useHistory();
    const [searchState, setSearchState] = useState(false);
    const { address: wagmiConnectAddress, status: wagmiStatus } = useAccount();
    const { connectAsync } = useConnect();
    const { disconnect } = useDisconnect();
    console.log("wagmi account status ", wagmiStatus);

    const onWalletBtnClick = () => {
        if (wagmiConnectAddress) {
            walletLogin();
        } else {
            connectAsync({ connector }).then((data) => {
                walletLogin();
            });
        }
    };
    const onDisconnectBtnClick = () => {
        disconnect();
        walletLogout();
    };

    const AuthLinks = () => {
        if (user && user.address) {
            return (
                <div className="btns">
                    {getDisplayAddress(user.address)}

                    <button
                        className={`s-btn s-btn__primary`}
                        onClick={onDisconnectBtnClick}
                    >
                        Disconnect
                    </button>
                </div>
            );
        } else if (loading || !user) {
            return (
                <div className="btns">
                    <Spinner width="50px" height="50px" />
                    <LinkButton
                        text={"Log out"}
                        link={"/login"}
                        type={"s-btn__filled"}
                        handleClick={onDisconnectBtnClick}
                    />
                </div>
            );
        } else {
            return (
                <div className="btns">
                    <Link
                        to={`/users/${user && user.id}`}
                        title={user && user.username}
                    >
                        <img
                            alt="user-logo"
                            className="logo"
                            src={user && user.gravatar}
                        />
                    </Link>
                    <LinkButton
                        text={"Log out"}
                        link={"/login"}
                        type={"s-btn__filled"}
                        handleClick={logout}
                    />
                </div>
            );
        }
    };

    const authTabs = (
        <div className="s-navigation">
            <Link to="/" className="s-navigation--item is-selected">
                Products
            </Link>
        </div>
    );

    const guestTabs = (
        <div className="s-navigation">
            <Link to="/" className="s-navigation--item is-selected">
                Products
            </Link>
            <Link to="/" className="s-navigation--item not-selected">
                Customers
            </Link>
            <Link to="/" className="s-navigation--item not-selected">
                Use cases
            </Link>
        </div>
    );

    const guestLinks = (
        <div className="btns">
            {/* <LinkButton text={'Connect Wallet'} link={'/login'} type={'s-btn__primary'} />
      <LinkButton text={'Sign up'} link={'/register'} type={'s-btn__filled'} />  */}
            {loading ? (
                <button className={`s-btn s-btn__primary`} disabled>
                    Authenticating...
                </button>
            ) : (
                <button
                    className={`s-btn s-btn__primary`}
                    onClick={onWalletBtnClick}
                >
                    Connect Wallet
                </button>
            )}
        </div>
    );

    const SearchBar = () => {
        return (
            <form
                onSubmit={() => history.push("/questions")}
                className="small-search-form"
                autoComplete="off"
            >
                <input
                    className="small-search"
                    autoComplete="off"
                    type="text"
                    name="search"
                    maxLength="35"
                    placeholder="Search..."
                />
                <Search className="small-search-icon" />
            </form>
        );
    };

    return (
        <Fragment>
            <nav className="navbar fixed-top navbar-expand-lg navbar-light bs-md">
                <div className="hamburger">
                    <MobileSideBar hasOverlay />
                </div>
                <div className="header-brand-div">
                    <Link className="navbar-brand" to="/">
                        {/* <Logo className='full-logo' />
            <SmallLogo className='glyph-logo' /> */}
                        <div className="navbar-brand-text">Stackunderflow</div>
                    </Link>
                    {!loading && (
                        <Fragment>
                            {isAuthenticated ? authTabs : guestTabs}
                        </Fragment>
                    )}
                </div>

                <form
                    id="search"
                    onSubmit={() => history.push("/questions")}
                    className={`grid--cell searchbar px12 js-searchbar`}
                    style={{ width: "40%" }}
                    autoComplete="off"
                >
                    <div className="ps-relative search-frame">
                        <input
                            className="s-input s-input__search h100 search-box"
                            autoComplete="off"
                            type="text"
                            name="search"
                            maxLength="35"
                            placeholder="Search..."
                        />
                        <Search />
                    </div>
                </form>
                <div className="header-search-div">
                    <Search
                        className="search-icon"
                        onClick={() => setSearchState(!searchState)}
                    />

                    <Fragment>
                        {!isAuthenticated ? guestLinks : <AuthLinks />}
                    </Fragment>
                </div>
            </nav>
            {searchState && <SearchBar />}
        </Fragment>
    );
};

Header.propTypes = {
    logout: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, {
    logout,
    walletLogin,
    walletLogout,
})(Header);

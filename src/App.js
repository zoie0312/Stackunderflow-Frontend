import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Switch } from "react-router-dom";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import store from "./redux/store";
import setAuthToken from "./redux/auth/auth.utils";
import { loadUser } from "./redux/auth/auth.actions";

import Header from "./components/organisms/Header/Header.component";
import Alert from "./components/Alert/Alert.component";
import HomePage from "./modules/HomePage/HomePage.component";
import QuestionsPage from "./modules/QuestionsPage/QuestionsPage.component";
import AllTagsPage from "./modules/AllTagsPage/AllTagsPage.component";
import AllUsersPage from "./modules/AllUsersPage/AllUsersPage.component";
import Register from "./modules/Register/Register.component";
import Login from "./modules/Login/Login.component";
import Post from "./modules/Post/Post.component";
import PostForm from "./modules/PostForm/PostForm.component";
import TagPage from "./modules/TagPage/TagPage.component";
import ProfilePage from "./modules/ProfilePage/ProfilePage.component";
import NotFound from "./modules/NotFound/NotFound.component";

import { BaseRoute, LayoutRoute } from "./Router";

import "./App.css";

const { chains, provider } = configureChains(
    [
        chain.mainnet,
        chain.polygon,
        chain.optimism,
        chain.arbitrum,
        chain.goerli,
    ],
    [
        alchemyProvider({
            apiKey: String(process.env.REACT_APP_ALCHEMY_API_KEY),
        }),
        publicProvider(),
    ]
);

const { connectors } = getDefaultWallets({
    appName: "My RainbowKit App",
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {
    // useEffect(() => {
    //     store.dispatch(loadUser());
    // }, []);

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <Provider store={store}>
                    <div className="App">
                        <Header />
                        <Alert />
                        <Switch>
                            <LayoutRoute
                                exact
                                path="/"
                                title="Stack Underflow - Where Developers Learn, Share, & Build Careers"
                            >
                                <HomePage />
                            </LayoutRoute>
                            <LayoutRoute
                                exact
                                path="/questions"
                                title="All Questions - CLONE Stack Overflow"
                            >
                                <QuestionsPage />
                            </LayoutRoute>
                            <LayoutRoute
                                exact
                                path="/tags"
                                title="Tags - CLONE Stack Overflow"
                            >
                                <AllTagsPage />
                            </LayoutRoute>
                            <LayoutRoute
                                exact
                                path="/users"
                                title="Users - CLONE Stack Overflow"
                            >
                                <AllUsersPage />
                            </LayoutRoute>
                            <BaseRoute
                                exact
                                path="/register"
                                title="Sign Up - CLONE Stack Overflow"
                            >
                                <Register />
                            </BaseRoute>
                            <BaseRoute
                                exact
                                path="/login"
                                title="Log In - CLONE Stack Overflow"
                            >
                                <Login />
                            </BaseRoute>
                            <LayoutRoute
                                exact
                                path="/questions/:id"
                                title="Users - CLONE Stack Overflow"
                            >
                                <Post />
                            </LayoutRoute>
                            <LayoutRoute
                                exact
                                path="/users/:id"
                                title="Users - CLONE Stack Overflow"
                            >
                                <ProfilePage />
                            </LayoutRoute>
                            <LayoutRoute
                                exact
                                path="/tags/:tagname"
                                title="Users - CLONE Stack Overflow"
                            >
                                <TagPage />
                            </LayoutRoute>
                            <BaseRoute
                                exact
                                path="/add/question"
                                title="Ask a Question - CLONE Stack Overflow"
                            >
                                <PostForm />
                            </BaseRoute>
                            <BaseRoute path="*" title="Error 404">
                                <NotFound />
                            </BaseRoute>
                        </Switch>
                    </div>
                </Provider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default App;

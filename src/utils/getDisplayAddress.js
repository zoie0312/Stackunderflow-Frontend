const getDisplayAddress = (address) => {
    const len = address.length;
    return `${address.substring(0, 5)}...${address.substring(len - 3)}`;
};

export default getDisplayAddress;

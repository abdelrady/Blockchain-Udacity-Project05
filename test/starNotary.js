//import 'babel-polyfill';
const StarNotary = artifacts.require('./starNotary.sol')

let instance;

contract('StarNotary', async (accs) => {
    let accounts = accs;

    it('can Create a Star', async() => {
      instance = await StarNotary.deployed();
      let tokenId = 1;
      await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
      assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
    });

    it('lets user1 put up their star for sale', async() => {
      instance = await StarNotary.deployed();
      let user1 = accounts[1]
      let starId = 2;
      let starPrice = web3.utils.toWei(".01", "ether")
      await instance.createStar('awesome star', starId, {from: user1})
      await instance.putStarUpForSale(starId, starPrice, {from: user1})
      assert.equal(await instance.starsForSale.call(starId), starPrice)
    });


  it('lets user1 get the funds after the sale', async() => {
    instance = await StarNotary.deployed();
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    let starPrice = web3.utils.toWei(".01", "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1)
    await instance.buyStar(starId, {from: user2, value: starPrice})
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1)
    assert.equal(parseInt(balanceOfUser1BeforeTransaction) + parseInt(starPrice), parseInt(balanceOfUser1AfterTransaction));
  });

  it('lets user2 buy a star, if it is put up for sale', async() => {
    instance = await StarNotary.deployed();
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    let starPrice = web3.utils.toWei(".01", "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async() => {
    instance = await StarNotary.deployed();
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    let starPrice = web3.utils.toWei(".01", "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2)
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0})
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2)
    assert.equal(parseInt(balanceOfUser2BeforeTransaction) - parseInt(balanceAfterUser2BuysStar), starPrice);
  });

// 1) The token name and token symbol are added properly.
it('Name & Symbol exists', async() => {
    instance = await StarNotary.deployed();

    assert.equal(await instance.starName.call(), "Rady Star Test");
    assert.equal(await instance.symbol.call(), "RST");
  });

// 2) 2 users can exchange their stars.
it('Exchange 1 star between 2 users', async() => {
    instance = await StarNotary.deployed();
    let tokenId = 6;
    await instance.createStar('Awesome Star #1', tokenId, {from: accounts[0]})
    await instance.createStar('Awesome Star #2', tokenId + 1, {from: accounts[1]})

    await instance.exchangeStars(accounts[1], tokenId, tokenId+1, {from: accounts[0]})

    assert.equal(await instance.ownerOf(tokenId), accounts[1])
    assert.equal(await instance.ownerOf(tokenId + 1), accounts[0])
  });

// 3) Stars Tokens can be transferred from one address to another.
it('Transfer 1 star from owner to another owner', async() => {
    instance = await StarNotary.deployed();
    let tokenId = 10;
    await instance.createStar('Awesome Star #1', tokenId, {from: accounts[0]})

    await instance.transferStar(accounts[1], tokenId, {from: accounts[0]})

    assert.equal(await instance.ownerOf(tokenId), accounts[1])
  });

  });

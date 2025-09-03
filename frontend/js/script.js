// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const submitVoteBtn = document.getElementById('submitVote');
const twitterHandlesInput = document.getElementById('twitterHandles');
const contributorsList = document.getElementById('contributorsList');
const votingInfo = document.getElementById('votingInfo');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notificationIcon');
const notificationMessage = document.getElementById('notificationMessage');

// State
let walletConnected = false;
let currentAddress = '';
let canVote = false;
let allContributors = [];

// Connect to MetaMask
connectWalletBtn.addEventListener('click', async () => {
    if (walletConnected) {
        // Disconnect wallet
        walletConnected = false;
        currentAddress = '';
        canVote = false;
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.classList.remove('connected');
        submitVoteBtn.disabled = true;
        submitVoteBtn.textContent = 'Submit Vote';
        votingInfo.textContent = 'Connected wallet: Not connected';
        showNotification('Wallet disconnected', 'info');
        return;
    }

    if (typeof window.ethereum === 'undefined') {
        showNotification('Please install MetaMask or Rabby Wallet', 'error');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAddress = accounts[0];
        
        // Check with our backend if user can vote
        const response = await fetch('/api/auth/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: currentAddress })
        });
        
        const data = await response.json();
        
        if (data.success) {
            walletConnected = true;
            connectWalletBtn.textContent = `${currentAddress.substring(0, 6)}...${currentAddress.substring(currentAddress.length - 4)}`;
            connectWalletBtn.classList.add('connected');
            votingInfo.textContent = `Connected wallet: ${currentAddress.substring(0, 6)}...${currentAddress.substring(currentAddress.length - 4)}`;
            
            if (data.canVote) {
                submitVoteBtn.disabled = false;
                showNotification('Wallet connected successfully. You can vote now.', 'success');
            } else {
                submitVoteBtn.disabled = true;
                submitVoteBtn.textContent = 'Already Voted Today';
                showNotification('Wallet connected. You have already voted today.', 'info');
            }
            
            canVote = data.canVote;
            loadContributors();
        } else {
            showNotification(data.error || 'Failed to connect wallet', 'error');
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
    }
});

// Form submission
submitVoteBtn.addEventListener('click', async () => {
    if (!canVote) {
        showNotification('You cannot vote at this time', 'error');
        return;
    }
    
    const input = twitterHandlesInput.value.trim();
    
    if (!input) {
        showNotification('Please enter at least one Twitter username', 'error');
        return;
    }
    
    // Parse usernames (remove @ and extra spaces)
    const usernames = input.split(',')
        .map(name => name.trim().replace('@', ''))
        .filter(name => name.length > 0);
    
    if (usernames.length === 0) {
        showNotification('Please enter valid Twitter usernames', 'error');
        return;
    }
    
    if (usernames.length > 3) {
        showNotification('You can vote for up to 3 usernames only', 'error');
        return;
    }
    
    // Check for duplicate usernames (case insensitive)
    const normalizedUsernames = usernames.map(u => u.toLowerCase());
    const uniqueNormalized = [...new Set(normalizedUsernames)];
    if (uniqueNormalized.length !== normalizedUsernames.length) {
        showNotification('You cannot vote for the same username multiple times. Please remove duplicates.', 'error');
        return;
    }
    
    // Validate each username
    for (const username of usernames) {
        if (!isValidUsername(username)) {
            showNotification(`"${username}" is not a valid Twitter username`, 'error');
            return;
        }
    }
    
    try {
        const response = await fetch('/api/vote/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: currentAddress,
                usernames: usernames
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Thanks for voting for ${usernames.length} user(s)! Your vote has been recorded.`, 'success');
            twitterHandlesInput.value = '';
            submitVoteBtn.disabled = true;
            submitVoteBtn.textContent = 'Already Voted Today';
            canVote = false;
            
            // Reload contributors to reflect new votes
            loadContributors();
        } else {
            showNotification(data.error || 'Failed to submit vote', 'error');
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        showNotification('Failed to submit vote', 'error');
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    filterContributors(e.target.value);
});

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    filterContributors('');
});

async function filterContributors(query) {
    if (!query.trim()) {
        displayContributors(allContributors);
        return;
    }
    
    const searchTerm = query.toLowerCase().replace('@', '');
    const filtered = allContributors.filter(contributor => 
        contributor.username.toLowerCase().includes(searchTerm)
    );
    
    displayContributors(filtered);
    
    if (filtered.length === 1) {
        const user = filtered[0];
        showNotification(`@${user.username} is ranked #${user.rank} with ${user.votes} votes`, 'success');
    }
}

// Username validation
function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9_]{1,15}$/;
    return regex.test(username);
}

// Notification system
function showNotification(message, type = 'info') {
    notification.className = 'notification';
    notificationIcon.textContent = type === 'error' ? '⚠️' : (type === 'success' ? '✓' : 'ℹ️');
    notificationMessage.textContent = message;
    
    if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'success') {
        notification.classList.add('success');
    }
    
    notification.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Load contributors from API
async function loadContributors() {
  try {
    const response = await fetch('/api/contributors');
    allContributors = await response.json();
    
    displayContributors(allContributors.slice(0, 10));
  } catch (error) {
    console.error('Error loading contributors:', error);
    contributorsList.innerHTML = '<div class="no-results">Failed to load contributors</div>';
  }
}

// Display contributors in the list
function displayContributors(contributors) {
    contributorsList.innerHTML = '';
    
    if (contributors.length === 0) {
        contributorsList.innerHTML = '<div class="no-results">No contributors found. Be the first to vote!</div>';
        return;
    }
    
    contributors.forEach(item => {
        const li = document.createElement('li');
        li.className = 'contributor-item';
        
        let rankClass = '';
        if (item.rank <= 10) {
            rankClass = `rank-${item.rank}`;
        } else {
            rankClass = 'rank-10';
        }
        
        li.innerHTML = `
            <div class="rank ${rankClass}">${item.rank}</div>
            <div class="user-info">
                <div class="twitter-handle">
                    <a href="https://x.com/${item.username}" target="_blank">@${item.username}</a>
                </div>
            </div>
            <div class="votes">${item.votes}</div>
        `;
        
        contributorsList.appendChild(li);
    });
}

// Initialize the page
loadContributors();
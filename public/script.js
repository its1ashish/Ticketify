// QR Code Generator
function generateQR(text) {
  if (document.getElementById('qrcode')) {
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
      text: text,
      width: 128,
      height: 128
    });
  }
}

// Document ready event handler
document.addEventListener("DOMContentLoaded", async () => {
  // Only generate QR code if needed
  if (document.getElementById('qrcode')) {
    generateQR("TICKET12345");
  }

  // Sidebar Toggle Functionality
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      mainContent.classList.toggle('sidebar-open');
    });
  }

  // Sidebar Close Button Functionality
  const sidebarClose = document.getElementById('sidebar-close');
  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
      sidebar.classList.remove('open');
      mainContent.classList.remove('sidebar-open');
    });
  }

  // Set up navigation links
  setupNavLinks();
  
  // Set up modals
  setupModals();
  
  // Fetch user data and content
  try {
    await fetchUserData();
    await fetchEvents();
    await fetchSpotifyData();
  } catch (error) {
    console.error("Error initializing data:", error);
  }
});

// Function to switch between sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

// Setup navigation links
function setupNavLinks() {
  const navLinks = {
    'home-link': 'home-section',
    'events-link': 'events-section',
    'artists-link': 'artists-section',
    'tracks-link': 'tracks-section',
    'tickets-link': 'tickets-section',
    'profile-link': 'profile-section',
    'support-link': 'support-section'
  };

  Object.entries(navLinks).forEach(([linkId, sectionId]) => {
    const link = document.getElementById(linkId);
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(sectionId);
      });
    }
  });
}

// Format date nicely
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Modal functionality
function setupModals() {
  const modal = document.getElementById('booking-modal');
  const closeModal = document.querySelector('.close-modal');

  if (closeModal && modal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Support Form Handler
  const supportForm = document.getElementById('support-form');
  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      
      // This would typically make an API call to submit the support request
      alert(`Support request submitted!\nSubject: ${subject}\nWe'll get back to you soon.`);
      supportForm.reset();
    });
  }
}

// Book Now Button Event Handler
function setupBookButtons() {
  const bookButtons = document.querySelectorAll('.event-card button[data-event-id]');
  bookButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const eventId = e.target.getAttribute('data-event-id');
      const modal = document.getElementById('booking-modal');
      
      if (!modal) {
        console.error('Booking modal not found in the DOM');
        return;
      }
      
      try {
        // Fetch event details
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        
        const event = await response.json();
        
        // Populate modal with event details
        document.getElementById('booking-event-name').textContent = event.eventName;
        document.getElementById('booking-event-artist').textContent = `Artist: ${event.artistName}`;
        document.getElementById('booking-event-date').textContent = `Date: ${formatDate(event.date)}`;
        document.getElementById('booking-event-venue').textContent = `Venue: ${event.venue}`;
        document.getElementById('booking-event-price').textContent = `Price: ₹${event.ticketPrice} per ticket`;
        document.getElementById('booking-tickets-available').textContent = 
          `Available: ${event.availableTickets} out of ${event.totalTickets}`;
        
        // Set event ID in hidden field
        document.getElementById('booking-event-id').value = event.eventId;
        
        // Calculate initial total
        const quantity = document.getElementById('ticket-quantity').value;
        document.getElementById('ticket-total').textContent = (quantity * event.ticketPrice).toFixed(2);
        
        // Show modal
        modal.style.display = 'block';
        
      } catch (error) {
        console.error('Error getting event details:', error);
        alert('Could not load event details. Please try again later.');
      }
    });
  });
  
  // Handle quantity change - update total price
  const quantityInput = document.getElementById('ticket-quantity');
  if (quantityInput) {
    quantityInput.addEventListener('change', async () => {
      const eventId = document.getElementById('booking-event-id').value;
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        
        const event = await response.json();
        const quantity = quantityInput.value;
        
        document.getElementById('ticket-total').textContent = (quantity * event.ticketPrice).toFixed(2);
      } catch (error) {
        console.error('Error updating price:', error);
      }
    });
  }
  
  // Handle booking form submission
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const eventId = document.getElementById('booking-event-id').value;
      const tickets = parseInt(document.getElementById('ticket-quantity').value);
      
      try {
        const response = await fetch('/api/book-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ eventId, tickets })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to book tickets');
        }
        
        alert('Tickets booked successfully!');
        modal.style.display = 'none';
        
        // Refresh events display
        fetchEvents();
        
      } catch (error) {
        console.error('Error booking tickets:', error);
        alert(`Booking failed: ${error.message}`);
      }
    });
  }
}

// Fetch and Display Events from the database
// Modified version of fetchEvents function with ranking based on user preferences
async function fetchEvents() {
  try {
    const eventsContainer = document.getElementById('events-list');
    const upcomingEventsContainer = document.getElementById('upcoming-events');
    
    if (!eventsContainer && !upcomingEventsContainer) {
      console.log('No event containers found, skipping event fetch');
      return;
    }
    
    // Show loading state
    if (eventsContainer) {
      eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';
    }
    if (upcomingEventsContainer) {
      upcomingEventsContainer.innerHTML = '<div class="loading">Loading events...</div>';
    }
    
    // Fetch user's top artists to use for ranking
    let topArtists = [];
    try {
      const artistRes = await fetch("/api/spotify/top-artists", { credentials: "include" });
      if (artistRes.ok) {
        const artistData = await artistRes.json();
        if (artistData.items && artistData.items.length > 0) {
          topArtists = artistData.items.map(artist => ({
            name: artist.name.toLowerCase(),
            popularity: artist.popularity,
            // Higher index = less preferred (reversed ranking)
            index: artistData.items.indexOf(artist)
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching artist preferences:", err);
      // Continue with unranked events if artist fetch fails
    }
    
    // Fetch all events
    const response = await fetch('/api/events');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let events = await response.json();
    
    // Rank events based on user's top artists if we have data
    if (topArtists.length > 0) {
      events = rankEventsByUserPreference(events, topArtists);
    }
    
    // Clear loading state
    if (eventsContainer) {
      eventsContainer.innerHTML = '';
    }
    if (upcomingEventsContainer) {
      upcomingEventsContainer.innerHTML = '';
    }
    
    if (events.length === 0) {
      if (eventsContainer) {
        eventsContainer.innerHTML = '<div class="empty-state">No events found</div>';
      }
      if (upcomingEventsContainer) {
        upcomingEventsContainer.innerHTML = '<div class="empty-state">No upcoming events</div>';
      }
      return;
    }
    
    // Process events for both containers
    events.forEach((event, index) => {
      // Create event card for the events section (horizontal layout)
      if (eventsContainer) {
        const eventCard = createEventCard(event, true);
        
        // Add a recommended badge if it matches user preferences
        if (event.userRelevanceScore > 0) {
          const badge = document.createElement('div');
          badge.classList.add('recommendation-badge');
          
          // Different badge levels based on score
          if (event.userRelevanceScore > 80) {
            badge.classList.add('high-match');
            badge.textContent = 'Top Match';
          } else if (event.userRelevanceScore > 50) {
            badge.classList.add('medium-match');
            badge.textContent = 'Recommended';
          } else if (event.userRelevanceScore > 0) {
            badge.classList.add('low-match');
            badge.textContent = 'Based on your taste';
          }
          
          eventCard.querySelector('.event-details').prepend(badge);
        }
        
        eventsContainer.appendChild(eventCard);
      }
      
      // Only add the first 4 events to the upcoming events on home page
      if (upcomingEventsContainer && index < 4) {
        const upcomingEventCard = createEventCard(event, false);
        
        // Add a simplified recommendation badge for home page
        if (event.userRelevanceScore > 50) {
          const badge = document.createElement('div');
          badge.classList.add('recommendation-badge');
          badge.textContent = '★';
          upcomingEventCard.appendChild(badge);
        }
        
        upcomingEventsContainer.appendChild(upcomingEventCard);
      }
    });
    
    // Setup book buttons after adding events to the DOM
    setupBookButtons();
    
  } catch (error) {
    console.error('Error fetching events:', error);
    if (document.getElementById('events-list')) {
      document.getElementById('events-list').innerHTML = 
        '<div class="empty-state">Failed to load events. Please try again later.</div>';
    }
    if (document.getElementById('upcoming-events')) {
      document.getElementById('upcoming-events').innerHTML = 
        '<div class="empty-state">Failed to load events. Please try again later.</div>';
    }
  }
}

/**
 * Ranks events based on user's top artists from Spotify
 * @param {Array} events - List of events to rank
 * @param {Array} topArtists - User's top artists from Spotify
 * @returns {Array} - Ranked events with added relevance score
 */
function rankEventsByUserPreference(events, topArtists) {
  // Clone events to avoid modifying original data
  const rankedEvents = [...events];
  
  // Calculate a relevance score for each event
  rankedEvents.forEach(event => {
    // Default score if no match
    let relevanceScore = 0;
    const eventArtist = event.artistName.toLowerCase();
    
    // Check if this event's artist is in user's top artists
    const matchingArtist = topArtists.find(artist => 
      eventArtist.includes(artist.name) || artist.name.includes(eventArtist)
    );
    
    if (matchingArtist) {
      // Calculate score based on artist position and popularity
      // Lower index = higher preference, max score 100
      const positionScore = Math.max(0, 100 - (matchingArtist.index * 5));
      
      // Popularity score (0-100 directly from Spotify)
      const popularityScore = matchingArtist.popularity;
      
      // Combined score with position weighted more heavily than general popularity
      relevanceScore = (positionScore * 0.7) + (popularityScore * 0.3);
    }
    
    // Add the score to the event object
    event.userRelevanceScore = Math.round(relevanceScore);
  });
  
  // Sort events by relevance score (highest first)
  rankedEvents.sort((a, b) => {
    // If scores are equal, sort by date
    if (b.userRelevanceScore === a.userRelevanceScore) {
      return new Date(a.date) - new Date(b.date);
    }
    // Otherwise sort by score
    return b.userRelevanceScore - a.userRelevanceScore;
  });
  
  return rankedEvents;
}


// Helper function to create event cards
function createEventCard(event, isHorizontal) {
  const eventCard = document.createElement('div');
  eventCard.classList.add('event-card');
  
  // Use a default image if none is provided
  const imageUrl = event.imageUrl || '/images/concert-placeholder.jpg';
  
  if (isHorizontal) {
    // Horizontal layout for events page
    eventCard.innerHTML = `
      <img src="${imageUrl}" alt="${event.eventName}">
      <div class="event-details">
        <h4>${event.eventName}</h4>
        <p><strong>Artist:</strong> ${event.artistName}</p>
        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Price:</strong> ₹${event.ticketPrice}</p>
        <p><strong>Available Tickets:</strong> ${event.availableTickets}/${event.totalTickets}</p>
        <button data-event-id="${event.eventId}">Book Now</button>
      </div>
    `;
  } else {
    // Vertical layout for homepage
    eventCard.innerHTML = `
      <img src="${imageUrl}" alt="${event.eventName}">
      <h4>${event.eventName}</h4>
      <p>${event.artistName}</p>
      <p>${formatDate(event.date)}</p>
      <p>${event.venue}</p>
      <button data-event-id="${event.eventId}">Book Now</button>
    `;
  }
  
  return eventCard;
}

// Fetch User Data from server
async function fetchUserData() {
  try {
    // Fetch User Data
    const userRes = await fetch("/debug", { credentials: "include" });
    if (!userRes.ok) {
      throw new Error(`HTTP error! Status: ${userRes.status}`);
    }
    
    const userData = await userRes.json();

    if (!userData.user || userData.user === "No user in session") {
      console.log("No user data found, user may need to log in");
      return;
    }

    // Update User Profile Section
    if (userData.user.profile) {
      const { profile } = userData.user;
      
      // Update username if element exists
      const usernameElement = document.getElementById("username");
      if (usernameElement) {
        usernameElement.innerText = `Welcome, ${profile.displayName || "User"}`;
      }
      
      // Update user email if element exists
      const userEmailElement = document.getElementById("user-email");
      if (userEmailElement) {
        userEmailElement.innerText = profile.emails?.[0]?.value || "Gold Member";
      }
      
      // Update profile name if element exists
      const profileNameElement = document.getElementById("profile-name");
      if (profileNameElement) {
        profileNameElement.innerText = profile.displayName || "User";
      }
      
      // Update profile email if element exists
      const profileEmailElement = document.getElementById("profile-email");
      if (profileEmailElement) {
        profileEmailElement.innerText = profile.emails?.[0]?.value || "Not available";
      }
      
      // Set avatar with a fallback
      const avatarUrl = profile.photos?.[0]?.value || "/images/avatar-placeholder.jpg";
      
      const avatarElement = document.getElementById("user-avatar");
      if (avatarElement) {
        avatarElement.src = avatarUrl;
        avatarElement.onerror = function() {
          this.src = "/images/avatar-placeholder.jpg";
        };
      }
      
      const profileAvatarElement = document.getElementById("profile-avatar");
      if (profileAvatarElement) {
        profileAvatarElement.src = avatarUrl;
        profileAvatarElement.onerror = function() {
          this.src = "/images/avatar-placeholder.jpg";
        };
      }
    }

  } catch (err) {
    console.error("Error fetching user data:", err);
  }
}

// Fetch Spotify Data (Top Artists and Tracks)
async function fetchSpotifyData() {
  // Fetch Top Artists
  try {
    const artistRes = await fetch("/api/spotify/top-artists", { credentials: "include" });
    if (!artistRes.ok) {
      throw new Error(`HTTP error! Status: ${artistRes.status}`);
    }
    
    const artistData = await artistRes.json();
    const artistList = document.getElementById("top-artists");
    
    if (artistList) {
      artistList.innerHTML = ''; // Clear any existing content
      
      if (artistData.items && artistData.items.length > 0) {
        artistData.items.forEach(artist => {
          const artistItem = document.createElement("div");
          artistItem.classList.add("event-card");
          
          // Get the first image or use a placeholder
          const imageUrl = artist.images && artist.images.length > 0 
            ? artist.images[0].url 
            : '/images/artist-placeholder.jpg';
            
          artistItem.innerHTML = `
            <img src="${imageUrl}" alt="${artist.name}">
            <h4>${artist.name}</h4>
            <p>Popularity: ${artist.popularity}</p>
          `;
          artistList.appendChild(artistItem);
        });
      } else {
        artistList.innerHTML = '<div class="empty-state">No top artists found</div>';
      }
    }
  } catch (artistError) {
    console.error("Error fetching top artists:", artistError);
    const artistList = document.getElementById("top-artists");
    if (artistList) {
      artistList.innerHTML = '<div class="empty-state">Could not load artist data</div>';
    }
  }
  
  // Fetch Top Tracks
  try {
    const trackRes = await fetch("/api/spotify/top-tracks", { credentials: "include" });
    if (!trackRes.ok) {
      throw new Error(`HTTP error! Status: ${trackRes.status}`);
    }
    
    const trackData = await trackRes.json();
    const trackList = document.getElementById("top-tracks");
    
    if (trackList) {
      trackList.innerHTML = ''; // Clear any existing content
      
      if (trackData.items && trackData.items.length > 0) {
        trackData.items.forEach(track => {
          const trackItem = document.createElement("div");
          trackItem.classList.add("event-card");
          
          // Get the first album image or use a placeholder
          const imageUrl = track.album && track.album.images && track.album.images.length > 0 
            ? track.album.images[0].url 
            : '/images/track-placeholder.jpg';
            
          trackItem.innerHTML = `
            <img src="${imageUrl}" alt="${track.name}">
            <h4>${track.name}</h4>
            <p>Artist: ${track.artists && track.artists.length > 0 ? track.artists[0].name : 'Unknown'}</p>
          `;
          trackList.appendChild(trackItem);
        });
      } else {
        trackList.innerHTML = '<div class="empty-state">No top tracks found</div>';
      }
    }
  } catch (trackError) {
    console.error("Error fetching top tracks:", trackError);
    const trackList = document.getElementById("top-tracks");
    if (trackList) {
      trackList.innerHTML = '<div class="empty-state">Could not load track data</div>';
    }
  }

  // Try to calculate fan score
  try {
    const fanScoreElement = document.getElementById('fan-score');
    if (fanScoreElement) {
      // This would typically come from your user profile or be calculated
      // For now we'll just set a placeholder value
      const randomScore = Math.floor(Math.random() * 50) + 50; // Random score between 50-100
      fanScoreElement.textContent = randomScore;
    }
  } catch (err) {
    console.error("Error setting fan score:", err);
  }
}
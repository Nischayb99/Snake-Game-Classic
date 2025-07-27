import User from '../models/User.js';

/**
 * @Description    Search users by username or name with enhanced filtering
 * @Route   GET /api/friends/search?q=query
 * @Access  Private
 */
export const searchUsers = async (req, res) => {
    try {
        const { q, filter = 'all', limit = 10 } = req.query;
        const currentUserId = req.user._id;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        let baseQuery = {
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                {
                    $or: [
                        { username: { $regex: q, $options: 'i' } },
                        { name: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        };

        // Enhanced filtering options
        switch (filter) {
            case 'active':
                // Users who played in the last 7 days
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                baseQuery['gameStats.lastPlayedAt'] = { $gte: weekAgo };
                break;
            case 'high_score':
                // Users with high scores (500+)
                baseQuery['gameStats.highestScore'] = { $gte: 500 };
                break;
            case 'beginners':
                // Users with less than 10 games
                baseQuery['gameStats.totalGamesPlayed'] = { $lt: 10 };
                break;
            case 'experienced':
                // Users with 50+ games
                baseQuery['gameStats.totalGamesPlayed'] = { $gte: 50 };
                break;
            default:
                // No additional filter
                break;
        }

        const users = await User.find(baseQuery)
            .select(`
                name username avatar bio 
                gameStats.highestScore gameStats.totalGamesPlayed 
                gameStats.lastPlayedAt gameStats.winRate
                achievements social.isPublic
            `)
            .sort({ 'gameStats.lastPlayedAt': -1, 'gameStats.highestScore': -1 })
            .limit(parseInt(limit));

        // Filter out users who don't want to be found (if they have privacy settings)
        const visibleUsers = users.filter(user => user.social?.isPublic !== false);

        res.json({
            success: true,
            users: visibleUsers,
            filter,
            total: visibleUsers.length
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users'
        });
    }
};

/**
 * @Description    Get enhanced user profile by ID
 * @Route   GET /api/friends/user/:id
 * @Access  Private
 */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        const user = await User.findById(id)
            .select(`
                name username avatar bio gameStats recentGames 
                createdAt friends friendRequests achievements 
                social preferences
            `)
            .populate('friends.user', 'name username avatar gameStats.highestScore')
            .populate('friendRequests.sent.to', 'name username avatar')
            .populate('friendRequests.received.from', 'name username avatar gameStats.highestScore');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if profile is public
        if (user.social?.isPublic === false && currentUserId.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: 'This profile is private'
            });
        }

        // Determine relationship status
        let relationshipStatus = 'none'; // none, friend, request_sent, request_received

        if (user._id.toString() === currentUserId.toString()) {
            relationshipStatus = 'self';
        } else {
            // Check if already friends
            const isFriend = user.friends.some(friend => friend.user._id.toString() === currentUserId.toString());
            if (isFriend) {
                relationshipStatus = 'friend';
            } else {
                // Check if request sent
                const requestSent = user.friendRequests.received.some(req => req.from._id.toString() === currentUserId.toString());
                if (requestSent) {
                    relationshipStatus = 'request_sent';
                } else {
                    // Check if request received
                    const requestReceived = user.friendRequests.sent.some(req => req.to._id.toString() === currentUserId.toString());
                    if (requestReceived) {
                        relationshipStatus = 'request_received';
                    }
                }
            }
        }

        // Don't expose sensitive friend request data to non-friends
        if (relationshipStatus !== 'self') {
            user.friendRequests = undefined;
            // Also filter recent games based on privacy settings
            if (!user.social?.shareStats) {
                user.recentGames = user.recentGames.slice(0, 3); // Show only last 3 games
            }
        }

        // Calculate additional profile stats
        const profileStats = {
            totalAchievements: user.achievements.length,
            achievementPoints: user.achievements.reduce((sum, a) => sum + (a.points || 0), 0),
            userLevel: Math.floor(user.gameStats.totalGamesPlayed / 10) + 1,
            friendCount: user.friends.length,
            joinedDaysAgo: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)),
            isActive: user.gameStats.lastPlayedAt &&
                (Date.now() - user.gameStats.lastPlayedAt) < (7 * 24 * 60 * 60 * 1000), // Active in last 7 days
            playStreak: user.gameStats.currentStreak,
            bestCategory: getBestCategory(user.gameStats)
        };

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                relationshipStatus,
                profileStats
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
};

// Helper function to determine user's best category
const getBestCategory = (gameStats) => {
    const categories = [];

    if (gameStats.bestEfficiency >= 2) categories.push('Efficient Player');
    if (gameStats.winRate >= 70) categories.push('Winner');
    if (gameStats.longestSnake >= 50) categories.push('Snake Master');
    if (gameStats.totalGamesPlayed >= 100) categories.push('Veteran');
    if (gameStats.highestScore >= 1000) categories.push('High Scorer');

    return categories.length > 0 ? categories[0] : 'Player';
};

/**
 * @Description    Send friend request with validation
 * @Route   POST /api/friends/request/:id
 * @Access  Private
 */
export const sendFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);

        // Check if target user exists and allows friend requests
        const targetUser = await User.findById(id).select('social');
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (targetUser.social?.allowFriendRequests === false) {
            return res.status(403).json({
                success: false,
                message: 'This user is not accepting friend requests'
            });
        }

        await currentUser.sendFriendRequest(id);

        res.json({
            success: true,
            message: 'Friend request sent successfully'
        });

    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to send friend request'
        });
    }
};

/**
 * @Description    Accept friend request
 * @Route   POST /api/friends/accept/:id
 * @Access  Private
 */
export const acceptFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);

        await currentUser.acceptFriendRequest(id);

        // Check for friend-related achievements
        const newAchievements = currentUser.checkAchievements();
        await currentUser.save();

        res.json({
            success: true,
            message: 'Friend request accepted successfully',
            newAchievements
        });

    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to accept friend request'
        });
    }
};

/**
 * @Description    Reject friend request
 * @Route   POST /api/friends/reject/:id
 * @Access  Private
 */
export const rejectFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);

        await currentUser.rejectFriendRequest(id);

        res.json({
            success: true,
            message: 'Friend request rejected successfully'
        });

    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to reject friend request'
        });
    }
};

/**
 * @Description    Remove friend
 * @Route   DELETE /api/friends/remove/:id
 * @Access  Private
 */
export const removeFriend = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);

        await currentUser.removeFriend(id);

        res.json({
            success: true,
            message: 'Friend removed successfully'
        });

    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to remove friend'
        });
    }
};

/**
 * @Description    Get current user's friends with enhanced data
 * @Route   GET /api/friends
 * @Access  Private
 */
export const getFriends = async (req, res) => {
    try {
        const { sortBy = 'recent', limit = 50 } = req.query;

        const user = await User.findById(req.user._id)
            .populate({
                path: 'friends.user',
                select: `
                    name username avatar bio
                    gameStats.highestScore gameStats.totalGamesPlayed 
                    gameStats.lastPlayedAt gameStats.winRate
                    gameStats.currentStreak social.showOnlineStatus
                `,
            })
            .select('friends');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Enhanced friend data with activity status
        let friendsWithStatus = user.friends.map(friendship => {
            const friend = friendship.user;
            const isOnline = friend.social?.showOnlineStatus &&
                friend.gameStats?.lastPlayedAt &&
                (Date.now() - friend.gameStats.lastPlayedAt) < (30 * 60 * 1000); // Online if played in last 30 min

            const isActive = friend.gameStats?.lastPlayedAt &&
                (Date.now() - friend.gameStats.lastPlayedAt) < (24 * 60 * 60 * 1000); // Active if played in last 24 hours

            return {
                ...friendship.toObject(),
                user: {
                    ...friend.toObject(),
                    onlineStatus: isOnline ? 'online' : (isActive ? 'active' : 'offline'),
                    friendshipDuration: Math.floor((Date.now() - friendship.addedAt) / (1000 * 60 * 60 * 24)) // days
                }
            };
        });

        // Sort friends based on sortBy parameter
        switch (sortBy) {
            case 'recent':
                friendsWithStatus.sort((a, b) => new Date(b.user.gameStats?.lastPlayedAt || 0) - new Date(a.user.gameStats?.lastPlayedAt || 0));
                break;
            case 'score':
                friendsWithStatus.sort((a, b) => (b.user.gameStats?.highestScore || 0) - (a.user.gameStats?.highestScore || 0));
                break;
            case 'name':
                friendsWithStatus.sort((a, b) => a.user.name.localeCompare(b.user.name));
                break;
            case 'friendship':
                friendsWithStatus.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                break;
            default:
                // Default to recent activity
                break;
        }

        // Apply limit
        friendsWithStatus = friendsWithStatus.slice(0, parseInt(limit));

        // Calculate friend statistics
        const friendStats = {
            total: user.friends.length,
            online: friendsWithStatus.filter(f => f.user.onlineStatus === 'online').length,
            active: friendsWithStatus.filter(f => f.user.onlineStatus === 'active').length,
            averageScore: Math.round(
                friendsWithStatus.reduce((sum, f) => sum + (f.user.gameStats?.highestScore || 0), 0) /
                friendsWithStatus.length
            ) || 0
        };

        res.json({
            success: true,
            friends: friendsWithStatus,
            friendStats,
            sortBy,
            total: friendsWithStatus.length
        });

    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get friends'
        });
    }
};

/**
 * @Description    Get friend requests (sent and received) with enhanced data
 * @Route   GET /api/friends/requests
 * @Access  Private
 */
export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'friendRequests.sent.to',
                select: 'name username avatar gameStats.highestScore gameStats.totalGamesPlayed'
            })
            .populate({
                path: 'friendRequests.received.from',
                select: `
                    name username avatar bio
                    gameStats.highestScore gameStats.totalGamesPlayed
                    gameStats.lastPlayedAt achievements
                `
            })
            .select('friendRequests');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Enhance received requests with additional user info
        const enhancedReceived = user.friendRequests.received.map(request => ({
            ...request.toObject(),
            from: {
                ...request.from.toObject(),
                userLevel: Math.floor(request.from.gameStats?.totalGamesPlayed / 10) + 1,
                achievementCount: request.from.achievements?.length || 0,
                isActive: request.from.gameStats?.lastPlayedAt &&
                    (Date.now() - request.from.gameStats.lastPlayedAt) < (7 * 24 * 60 * 60 * 1000),
                daysSinceRequest: Math.floor((Date.now() - request.receivedAt) / (1000 * 60 * 60 * 24))
            }
        }));

        // Sort by most recent
        enhancedReceived.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        user.friendRequests.sent.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

        res.json({
            success: true,
            friendRequests: {
                received: enhancedReceived,
                sent: user.friendRequests.sent
            },
            counts: {
                received: enhancedReceived.length,
                sent: user.friendRequests.sent.length
            }
        });

    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get friend requests'
        });
    }
};

/**
 * @Description    Get friends leaderboard (compare with friends)
 * @Route   GET /api/friends/leaderboard
 * @Access  Private
 */
export const getFriendsLeaderboard = async (req, res) => {
    try {
        const { type = 'highestScore', limit = 20 } = req.query;
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate({
                path: 'friends.user',
                select: `
                    name username avatar
                    gameStats.highestScore gameStats.totalScore
                    gameStats.totalGamesPlayed gameStats.winRate
                    gameStats.longestSnake gameStats.bestEfficiency
                `
            })
            .select('friends gameStats name username avatar');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Include current user in the leaderboard
        let participants = [
            {
                _id: user._id,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                gameStats: user.gameStats,
                isSelf: true
            },
            ...user.friends.map(friendship => ({
                ...friendship.user.toObject(),
                isSelf: false,
                friendshipDate: friendship.addedAt
            }))
        ];

        // Filter out users with no games played
        participants = participants.filter(p => p.gameStats?.totalGamesPlayed > 0);

        // Sort based on type
        let sortField;
        switch (type) {
            case 'totalScore':
                sortField = 'gameStats.totalScore';
                break;
            case 'totalGames':
                sortField = 'gameStats.totalGamesPlayed';
                break;
            case 'winRate':
                sortField = 'gameStats.winRate';
                participants = participants.filter(p => p.gameStats.totalGamesPlayed >= 5); // Min games for win rate
                break;
            case 'longestSnake':
                sortField = 'gameStats.longestSnake';
                break;
            case 'efficiency':
                sortField = 'gameStats.bestEfficiency';
                break;
            default:
                sortField = 'gameStats.highestScore';
        }

        participants.sort((a, b) => {
            const aValue = a.gameStats[sortField.split('.')[1]] || 0;
            const bValue = b.gameStats[sortField.split('.')[1]] || 0;
            return bValue - aValue;
        });

        // Add ranks and limit results
        const rankedParticipants = participants.slice(0, parseInt(limit)).map((participant, index) => ({
            ...participant,
            rank: index + 1,
            isTopRank: index < 3
        }));

        // Find current user's position if not in top results
        const userRank = participants.findIndex(p => p._id.toString() === userId.toString()) + 1;

        res.json({
            success: true,
            leaderboard: rankedParticipants,
            userRank,
            type,
            totalParticipants: participants.length
        });

    } catch (error) {
        console.error('Get friends leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get friends leaderboard'
        });
    }
};

/**
 * @Description    Get mutual friends between current user and another user
 * @Route   GET /api/friends/mutual/:id
 * @Access  Private
 */
export const getMutualFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        if (currentUserId.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot get mutual friends with yourself'
            });
        }

        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId).select('friends').populate('friends.user', 'name username avatar'),
            User.findById(id).select('friends').populate('friends.user', 'name username avatar')
        ]);

        if (!currentUser || !targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find mutual friends
        const currentUserFriendIds = currentUser.friends.map(f => f.user._id.toString());
        const mutualFriends = targetUser.friends.filter(friendship =>
            currentUserFriendIds.includes(friendship.user._id.toString())
        );

        res.json({
            success: true,
            mutualFriends,
            count: mutualFriends.length
        });

    } catch (error) {
        console.error('Get mutual friends error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get mutual friends'
        });
    }
};

export default {
    searchUsers,
    getUserProfile,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriends,
    getFriendRequests,
    getFriendsLeaderboard,
    getMutualFriends
};
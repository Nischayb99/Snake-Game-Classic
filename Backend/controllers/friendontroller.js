import User from '../models/User.js';

/**
 * @Description    Search users by username or name
 * @Route   GET /api/friends/search?q=query
 * @Access  Private
 */
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const currentUserId = req.user._id;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                {
                    $or: [
                        { username: { $regex: q, $options: 'i' } },
                        { name: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        })
            .select('name username avatar gameStats.highestScore gameStats.totalGamesPlayed')
            .limit(10);

        res.json({
            success: true,
            users
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
 * @Description    Get user profile by ID
 * @Route   GET /api/friends/user/:id
 * @Access  Private
 */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        const user = await User.findById(id)
            .select('name username avatar bio gameStats recentGames createdAt friends friendRequests')
            .populate('friends.user', 'name username avatar')
            .populate('friendRequests.sent.to', 'name username avatar')
            .populate('friendRequests.received.from', 'name username avatar');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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
        }

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                relationshipStatus
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

/**
 * @Description    Send friend request
 * @Route   POST /api/friends/request/:id
 * @Access  Private
 */
export const sendFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);

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

        res.json({
            success: true,
            message: 'Friend request accepted successfully'
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
 * @Description    Get current user's friends
 * @Route   GET /api/friends
 * @Access  Private
 */
export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends.user', 'name username avatar gameStats.highestScore gameStats.totalGamesPlayed gameStats.lastPlayedAt')
            .select('friends');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            friends: user.friends
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
 * @Description    Get friend requests (sent and received)
 * @Route   GET /api/friends/requests
 * @Access  Private
 */
export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friendRequests.sent.to', 'name username avatar')
            .populate('friendRequests.received.from', 'name username avatar gameStats.highestScore')
            .select('friendRequests');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            friendRequests: user.friendRequests
        });

    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get friend requests'
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
    getFriendRequests
};
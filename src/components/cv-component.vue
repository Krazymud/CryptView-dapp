<template>
    <div class="cv-container">
        <b-modal id="myModal"
                ref="myModalRef"
                title="Replying"
                @ok.prevent="newReply"
                @shown="clearAll">
            <b-form-group horizontal
                    label="Nickname:"
                    label-class="text-sm-right">
                <b-form-input v-model="nickname"></b-form-input>
            </b-form-group>
            <b-form-group horizontal
                            label="Content:"
                            label-class="text-sm-right">
                <b-form-textarea    v-model="content"
                                    :rows="3"
                                    :max-rows="5">
                </b-form-textarea>
            </b-form-group>
            <b-form-group horizontal
                            label="Account:"
                            label-class="text-sm-right">
                <b-form-select :options="[web3.coinbase]">
                </b-form-select>
            </b-form-group>
            <b-form-group horizontal
                            label="Allow update:"
                            label-class="text-sm-right"
                            class="mb-0">
                <b-form-radio-group class="pt-2" :options="options" v-model="allowUpdate">
                </b-form-radio-group>
            </b-form-group>
            <b-alert :show="dismissCountdown"
                dismissible
                variant="warning"
                @dismissed="dismissCountdown=0"
                @dismiss-count-down="countdownChanged">
                <p>{{errorMessage}}</p>
                <b-progress variant="warning"
                            :max="dismissSecs"
                            :value="dismissCountdown"
                            height="4px">
                </b-progress>
            </b-alert>
        </b-modal>
        <b-modal id="rewardModal"
                ref="rewardModal"
                @ok.prevent="newReward"
                @shown="clearAll">
                <b-form-group horizontal
                            label="Ether(wei):"
                            label-class="text-sm-right"
                            class="mb-0">
                <b-form-input v-model="ether"></b-form-input>
            </b-form-group>
            <b-alert :show="dismissCountdown"
                dismissible
                variant="warning"
                @dismissed="dismissCountdown=0"
                @dismiss-count-down="countdownChanged">
                <p>{{errorMessage}}</p>
                <b-progress variant="warning"
                            :max="dismissSecs"
                            :value="dismissCountdown"
                            height="4px">
                </b-progress>
            </b-alert>
        </b-modal>
        <div v-for="(view, index) in viewList" :key="index" class="card">
            <b-card :title="view.author">
                <p class="card-text">
                    {{ view.content }}
                </p>
                <b-button v-on:click="toReply = index" v-b-modal.myModal variant="link">reply</b-button>
                <b-button v-on:click="handleLike(index, 0)" variant="link">like: {{ view.likes }}</b-button>
                <b-button v-on:click="handleReward(index, 0)" v-b-modal.rewardModal variant="link">reward: {{ view.rewards }} wei</b-button>
                <b-badge>{{ view.time }}</b-badge>
                <div v-for="(reply, inde) in view.replyList" v-bind:key="inde" class="reply">
                    <hr />
                    <b-card  :title="reply.author">
                        <p class="card-text">
                            {{ reply.content }}
                        </p>
                        <b-button v-on:click="handleLike(index, inde + 1)" variant="link">like: {{ reply.likes }}</b-button>
                        <b-button v-on:click="handleReward(index, inde + 1)" v-b-modal.rewardModal variant="link">reward: {{ reply.rewards }} wei</b-button>
                        <b-badge>{{ reply.time }}</b-badge>
                    </b-card>
                </div>
            </b-card>
        </div>
    </div>
</template>

<script>
// import Vue from 'vue'
export default {
    name: 'cryptview',
    data: function () {
        return {
            ether: 0,
            nickname: '',
            rewardV: -1,
            rewardR: -1,
            content: '',
            toReply: -1,
            dismissSecs: 4,
            dismissCountdown: 0,
            errorMessage: '',
            allowUpdate: 'yes',
            options: [
                { text: 'Yes', value: 'yes' },
                { text: 'No', value: 'no' }
            ],
            viewList: [],
            tempList: [],
            count: 0,
            timeing: null
        }
    },
    computed: {
        web3 () {
            return this.$store.state.web3
        }
    },
    mounted () {
        this.updateViews()
        this.timeing = setInterval(this.updateViews, 1000)
    },
    methods: {
        newReward () {
            if (this.ether === 0) {
                this.showAlert('No ether to reward!')
            } else {
                console.log(this.ether, this.rewardV, this.rewardR)
                this.$refs.rewardModal.hide()
                this.rewardV = this.count - 1 - this.rewardV
                if (this.rewardR === 0) {
                    if (this.web3.coinbase === this.viewList[this.rewardV].sender) {
                        alert('You can\'t reward yourself')
                    } else {
                        this.$store.state.contractInstance().reward.sendTransaction(this.rewardV, this.rewardR, {value: this.ether, from: this.web3.coinbase}, (error) => {
                            if (error) {
                                console.log(error)
                            }
                        })
                    }
                } else {
                    if (this.web3.coinbase === this.viewList[this.rewardV].replyList[this.rewardR - 1].sender) {
                        alert('You can\'t reward yourself')
                    } else {
                        this.$store.state.contractInstance().reward.sendTransaction(this.rewardV, this.rewardR, {value: this.ether, from: this.web3.coinbase}, (error) => {
                            if (error) {
                                console.log(error)
                            }
                        })
                    }
                }
            }
        },
        handleReward (toRewardv, toRewardr) {
            this.rewardV = toRewardv
            this.rewardR = toRewardr
        },
        handleLike (toLikev, toLiker) {
            console.log(toLikev, toLiker)
            toLikev = this.count - 1 - toLikev
            if (toLiker === 0) {
                if (this.web3.coinbase === this.viewList[toLikev].sender) {
                    alert('You can\'t upvote yourself')
                } else {
                    this.$store.state.contractInstance().like.sendTransaction(toLikev, toLiker, {from: this.web3.coinbase}, (error) => {
                        if (error) {
                            console.log(error)
                        }
                    })
                }
            } else {
                if (this.web3.coinbase === this.viewList[toLikev].replyList[toLiker - 1].sender) {
                    alert('You can\'t upvote yourself')
                } else {
                    this.$store.state.contractInstance().like.sendTransaction(toLikev, toLiker, {from: this.web3.coinbase}, (error) => {
                        if (error) {
                            console.log(error)
                        }
                    })
                }
            }
        },
        newReply () {
            let update
            if (this.allowUpdate === 'yes') {
                update = true
            } else update = false
            if (this.nickname === '' || this.content === '') {
                this.showAlert('Please fill in all the blanks')
            } else {
                this.toReply = this.count - 1 - this.toReply
                console.log('reply to' + this.toReply)
                this.$store.state.contractInstance().reply.sendTransaction(this.toReply, this.content, update, this.nickname, {from: this.web3.coinbase}, (error, result) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('New reply!')
                    }
                })
                this.$refs.myModalRef.hide()
            }
        },
        clearAll () {
            this.nickname = ''
            this.content = ''
        },
        showAlert (msg) {
            this.dismissCountdown = this.dismissSecs
            this.errorMessage = msg
        },
        countdownChanged (newCountdown) {
            this.dismissCountdown = newCountdown
        },
        updateViews () {
            if (this.$store.state.contractInstance !== null && typeof this.$store.state.contractInstance !== 'undefined') {
                clearInterval(this.timeing)
                this.timeing = setInterval(this.updateViews, 20000)
                this.$store.state.contractInstance().count.call(function (error, result) {
                    if (error) {
                        console.log(error)
                    } else {
                        let cnt = result.c[0]
                        this.count = cnt
                        console.log('updating...')
                        this.tempList = []
                        this.readViews(0, 0, cnt)
                    }
                }.bind(this))
            }
        },
        readViews (shareId, replyId, length) {
            if (length > 0) {
                this.$store.state.contractInstance().ideas.call(shareId, replyId, function (error, result) {
                    if (error) {
                        if (length > 1) {
                            this.readViews(shareId + 1, 0, length - 1)
                        } else {
                            this.tempList.reverse()
                            this.viewList = this.tempList
                        }
                    } else {
                        var view = result
                        var time_ = new Date(view[4].c[0] * 1000).toLocaleString()
                        this.$store.state.contractInstance().getLikes.call(shareId, replyId, function (error, result) {
                            if (error) {
                                console.log(error)
                            } else {
                                var numOfLike = result.c[0]
                                this.$store.state.contractInstance().getAllRewards.call(shareId, replyId, function (error, result) {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        var numOfReward = result.c[0].toString()
                                        if (replyId === 0) {
                                            var newView = {
                                                sender: view[0],
                                                author: view[2],
                                                content: view[1],
                                                replyList: [],
                                                likes: numOfLike,
                                                rewards: numOfReward,
                                                time: time_
                                            }
                                            this.tempList.push(newView)
                                        } else {
                                            var newReply = {
                                                sender: view[0],
                                                author: view[2],
                                                content: view[1],
                                                likes: numOfLike,
                                                rewards: numOfReward,
                                                time: time_
                                            }
                                            this.tempList[shareId].replyList.push(newReply)
                                            // Vue.set(this.viewList[this.count - 1 - shareId].replyList, replyId, newReply)
                                        }
                                        this.readViews(shareId, replyId + 1, length)
                                    }
                                }.bind(this))
                            }
                        }.bind(this))
                    }
                }.bind(this))
            } else {
                this.viewList = this.tempList
            }
        }
    }
}
</script>

<style scoped>
    .card {
        width: 800px;
        margin: 0 auto;
    }
    .reply .card {
        width: 750px !important;
    }
</style>

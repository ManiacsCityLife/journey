import { useState, useRef, useEffect } from 'react';
import type { UserProfile } from '../types';
import { storageGet, storageSet, storageKeys, storageRemove } from '../utils/storage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  startedAt: number;
  messages: Message[];
}

interface BuddyProps {
  profile: UserProfile | null;
  soberDays: number;
  emergencyMode?: boolean;
  onClose?: () => void;
}


// ── 1000-Response Scripted Engine ─────────────────────────────────────────────

const R: Record<string, string[]> = {

  // ── ACTIVE CRAVING (50) ───────────────────────────────────────────────────
  craving: [
    "That craving is real and I hear you. But here's what's also real — it will peak in the next 15 to 20 minutes and then it falls. Your job right now is just to outlast it. Can you open the Emergency Kit and start the urge timer?",
    "A craving just means your brain is remembering something it used to rely on. It doesn't mean you need to drink. It means you need to ride this wave. You've done it before — you can do it now.",
    "The craving is loud right now, I know. But loud isn't the same as right. Get up, change your location, drink a glass of cold water. Interrupt the pattern. The urge will follow.",
    "Right now your brain is asking for something it used to use as a shortcut. But you know what's on the other side of that shortcut — you've been there. Stay on this road.",
    "Cravings are your nervous system doing something automatic — it's not a character flaw and it's not a failure. Acknowledge it. Name it. 'I'm having a craving.' Then let it pass without acting on it.",
    "You reached out instead of reaching for a drink. That matters more than you know. Let's get through the next 20 minutes together. What's one thing you can physically do right now — walk, cold water, push-ups?",
    "The craving is a liar. It promises relief and delivers regret. You already know this. That knowledge is your weapon right now — use it.",
    "Urge surfing: imagine the craving as a wave in the ocean. You're standing on the shore. Watch it build, watch it peak, watch it crash and recede. You don't have to swim in it. You can just watch.",
    "Here's what's happening physiologically — your brain just released a hunger signal for dopamine. Alcohol used to answer that call. But your brain is building new pathways now. This craving is literally the sound of old pathways firing for the last time.",
    "You've survived 100% of the cravings you've ever had. You're still here. This one is no different — even if it feels that way.",
    "When a craving hits, try the 5-minute rule. Tell yourself you only have to last 5 minutes. When the 5 minutes are up, give yourself another 5. Cravings rarely last longer than 20 minutes at full intensity.",
    "The urge to drink is just a feeling. It has no power over you unless you act on it. Feelings pass — every single one of them. This one will too.",
    "I want you to do something for me right now — name three things you can see in the room around you. Three things you can feel with your hands. This grounds you back in the present moment, away from the craving.",
    "Your brain is in a tug-of-war right now. One side wants the old relief, the other knows the truth. You are not powerless in this — you get to choose which side gets fed.",
    "The most powerful thing you can do right now is delay. Don't say no forever — just say not for the next 20 minutes. Then check in again. Cravings cannot sustain at full intensity — they will drop.",
    "Notice where the craving lives in your body. Is it in your chest? Your throat? Your stomach? Put your hand there. Breathe into it. You are not the craving — you are the one noticing it.",
    "When the craving is loud, the brain wants to negotiate. It'll say 'just one', 'you deserve it', 'this one time'. These are not your thoughts — they're the addiction talking. Don't negotiate.",
    "A craving is proof that your brain is changing. Old neural pathways lighting up as they lose power. Every craving you ride out weakens them further.",
    "Right now the Emergency Kit has a breathing exercise called Rescue Breath — it's 2 seconds in, 4 seconds out. It physically lowers your heart rate and takes the edge off the craving. Go try it.",
    "You are so much more than this craving. It does not define you and it does not have to win. You've built something real with your sobriety — don't let 20 minutes of discomfort undo it.",
    "The craving will pass whether you drink or not. If you drink, it passes and you feel shame. If you don't drink, it passes and you feel stronger. Same amount of time — very different outcome.",
    "Tell the craving: I see you. I know what you want. But I'm not giving it to you today.",
    "Intense cravings are often dehydration, hunger, or exhaustion in disguise. Have you eaten today? Had water? When did you last sleep properly? Address the basics first.",
    "Every craving you survive is a small victory that compounds. You are not just surviving tonight — you are building the person who never goes back.",
    "Try this: on a scale of 1 to 10, how intense is the craving right now? Write it down or say it out loud. Then check again in 5 minutes. Watching the number fall is incredibly empowering.",
    "The Emergency Kit's urge surfing timer is built for exactly this moment. 15 minutes on the clock. You just have to get to the other side.",
    "Is there someone you can call or text right now? Not to explain everything — just to hear a voice, or know someone knows. Connection is the antidote to addiction.",
    "Change your physical state. Go outside. Splash cold water on your face. Do 10 jumping jacks. Your body follows your brain — but your brain also follows your body.",
    "A craving is not a sign that sobriety isn't working. It's a sign that it is — your brain is still recalibrating, and recalibration is noisy.",
    "Hold on. Just hold on. Not forever. Just right now. That's all you need to do.",
    "You didn't come this far to only come this far. The craving is testing you. And you are going to pass.",
    "Think about tomorrow morning. Waking up without shame, without a hangover, without regret. That feeling is waiting for you on the other side of this craving.",
    "The craving is peak intensity right now — that means it's about to start falling. Cravings follow a bell curve. You're near the top. Hold tight.",
    "Your sobriety is worth more than this moment of discomfort. Whatever you built — the days, the clarity, the relationships — it's all still there if you hold on.",
    "Try ice cold water, a strong flavour like mint or citrus, or something physically demanding. These interrupt the craving signal in the brain.",
    "It helps to remember that you're not white-knuckling your way through life — you're actively building a better one. This craving is friction in that process. Normal. Expected. Survivable.",
    "Do you know what triggered this one? Stress, boredom, a memory, a smell, a time of day? Naming the trigger takes power away from it.",
    "You reached out. That's the first and most important step. You are not alone in this moment.",
    "Cravings under 20 minutes: that's the research. Under 20 minutes. You can do 20 minutes standing on your head.",
    "When the craving hits, remind yourself why you started. Not in a lecture-yourself way — but genuinely remember. What were you protecting? Who were you protecting?",
    "Your brain is literally growing new connections right now. Sobriety is neurological change. The craving is the old wiring resisting. Keep going.",
    "Try this: breathe in for 4 counts, hold for 4, out for 4, hold for 4. Box breathing. Do it three times. Your nervous system will respond.",
    "You are bigger than this craving. I know it doesn't feel like it right now. But you are.",
    "One breath at a time. One minute at a time. One craving at a time. That's all this is.",
    "It passed last time. It'll pass this time. You know this. Trust what you know.",
    "The version of you on the other side of this craving is proud of you already. Get to them.",
    "You're not just fighting a craving — you're fighting for your life, your health, your relationships, your future. That's worth fighting for.",
    "Acknowledge it. Accept that it's happening. Then choose differently anyway. That's the whole skill in one sentence.",
    "Whatever brought the craving on — stress, boredom, pain — alcohol will make it worse, not better. You already know this is true.",
    "You've got this. Not 'maybe' got this. You've got this.",
  ],

  // ── RELAPSE / SLIP (50) ──────────────────────────────────────────────────
  relapse: [
    "Thank you for telling me. That took courage, and I'm not going anywhere. A slip is not the end of your story — it's a hard chapter. What matters now is what you do next.",
    "You reached out after a slip — that is the single most important thing you could have done. A lot of people go quiet. You didn't. That tells me who you really are.",
    "A relapse does not erase your days. It does not erase your progress or the growth that happened. It is a setback, not a reset to zero. Everything you learned is still inside you.",
    "I'm not going to shame you. You already know what happened. What I want to know is: what led up to it? What was the trigger? That's where we work.",
    "Relapse is part of many people's recovery story. It doesn't mean sobriety is impossible for you — it means you found a gap in your armour. Now we find it and close it.",
    "The hardest thing after a slip is not starting again — it's forgiving yourself enough to start again. Can you give yourself that?",
    "You are not a failure. You are a person fighting a genuinely hard fight. And you're still fighting — because you're here.",
    "What you're feeling right now — shame, guilt, disappointment — those are real feelings and they make sense. But don't let them become the reason you keep going. Pain is not a good enough reason to drink more.",
    "The slip happened. We can't undo it. What we can do is understand it, learn from it, and decide what today looks like. One day. Just today.",
    "Did anything feel different in the days leading up to it? Stress, isolation, skipping the things that were helping? Most slips have a trail of warning signs in hindsight.",
    "You're allowed to be angry at yourself — for a minute. But then we move. The longer you sit in the shame spiral, the harder it gets to climb back out.",
    "Sobriety isn't a streak you lose and have to restart from scratch. It's a practice. And you get back to practice.",
    "Your sober days still count. Every one of them. What you built in that time — the neural healing, the emotional growth — that doesn't evaporate with one night.",
    "I want to ask you something honestly: what is the story you're telling yourself right now? That you've failed? That you're weak? I want to challenge that story.",
    "A lot of people relapse before they get their long-term sobriety. It is not destiny. It is not fate. It is information. What does it tell you about what you need?",
    "Be gentle with yourself right now. Recovery is not linear. It never was. The path winds — what matters is you keep walking it.",
    "The moment after a relapse is critical. Not because you need to punish yourself, but because the choices you make right now set the trajectory. Come back to the tools. Come back to this.",
    "Tell me what happened, if you want to. Not to judge — to understand. Understanding is how we prevent the next one.",
    "You are not your worst moment. You are the sum of every effort you've made, every craving you've survived, every morning you chose sobriety. That is who you are.",
    "Reach out to someone in your life today if you can — a friend, a family member, anyone who knows what you're going through. You don't have to do this alone.",
    "The shame you're feeling right now? Alcohol is good at producing it and bad at relieving it. Don't let it drive you further down.",
    "What was the very first thought you had before the slip? That moment — that's where the work is.",
    "I want you to set one small commitment for today. Not 'I'll never drink again' — just 'I will not drink today.' Just today. Can you do that?",
    "You came back here. That means something. A lot of people don't come back — they disappear into the shame. You didn't. You're fighting.",
    "Think about the version of you that has 90 days. Or a year. Or five years. That person exists in a possible future — and they got there by doing exactly what you're doing right now: not giving up.",
    "Recovery from a relapse starts with one sober hour. Then another. Then a day. You've built those hours before — you can do it again.",
    "This does not define you. It is a moment in a much longer story.",
    "What support do you have around you? Sometimes a relapse is a sign that we need more — more community, more structure, more accountability.",
    "The Emergency Kit is there for exactly this — the morning after, when the shame is heavy and the urge to avoid the pain by drinking more is strong. Go use it.",
    "There is no timeline for recovery. No right speed, no perfect record. There is only the next right choice. What is your next right choice?",
    "You are braver than you feel right now. I promise you that.",
    "Take a breath. Drink some water. Eat something. Take care of the basics right now. Your brain needs fuel to make good decisions.",
    "It's okay to grieve the slip. It's okay to feel disappointed. Just don't live there.",
    "What do you need right now — to talk it through, to make a plan, to just not be alone with it?",
    "Relapse is not the opposite of recovery. It's part of many people's recovery. You are not alone in this.",
    "Every person who has found long-term sobriety has had hard days. Many have had slips. What they share is this: they got back up.",
    "You are the same person who made the choice to start this journey. That person is still in there. Find them.",
    "The craving that preceded the slip — that's the one we need to talk about. What did it feel like? What was the context?",
    "I am proud of you for being honest about what happened. That kind of honesty is rare and it is the foundation of everything.",
    "Don't catastrophise this. One slip does not equal a lifetime of drinking. It equals one slip. Respond to that — not to a story you've invented about what it means.",
    "What would you say to a close friend who told you they'd slipped? Say that to yourself.",
    "The road back starts right now, right here, with this conversation. You're already on it.",
    "I'm not going anywhere. Talk to me. What do you need?",
    "The guilt is understandable. But guilt without action just becomes shame, and shame is the enemy of recovery. Let's turn this into something.",
    "You've proven you can build sober days. You will build them again. That knowledge doesn't go away.",
    "What would make today better than yesterday? Just one thing. Start there.",
    "You're still in this. A slip doesn't mean you left — it means you stumbled. You're still on the path.",
    "The people in your life who love you — what would they say right now if they knew you were in here, fighting to come back? Listen to those voices.",
    "This is survivable. I know it feels enormous. It is survivable.",
    "Come back. Just come back. That's all you have to do.",
  ],

  // ── STRESS & ANXIETY (50) ────────────────────────────────────────────────
  stress: [
    "Stress is one of the biggest relapse triggers in recovery, and you're not imagining how hard it feels right now. Your body is responding to stress the way it used to — by reaching for the old reliever. Let's interrupt that.",
    "When stress hits in sobriety, the brain screams for its old shortcut. The shortcut is gone — so you have to find the longer road. It's harder and it's worth it.",
    "Tell me what's stressing you. Not to fix it — just to get it out of your head and into words. That act alone reduces the pressure.",
    "Your nervous system is overwhelmed right now. Box breathing — 4 counts in, 4 hold, 4 out, 4 hold — directly activates your parasympathetic system. It's not a trick, it's physiology.",
    "Stress without alcohol forces you to actually feel it and deal with it. That's harder in the short term and it's how you actually heal in the long term.",
    "The 4-7-8 breath is one of the most effective anxiety tools in existence: 4 in, 7 hold, 8 out. Do it three times. Your heart rate will respond.",
    "You're carrying a lot. I can hear that. You don't have to carry it all tonight. What's the most urgent thing, and what can wait?",
    "Stress and anxiety feel enormous in early recovery because you're feeling them without a numbing agent for the first time in a long time. You're not weak — you're new at this.",
    "Cortisol and adrenaline are flooding your system right now. Walk. Move. Physical movement metabolises these hormones faster than anything else.",
    "The Emergency Kit has a breathing exercise called Power Breath — extended exhale of 8 counts. It is specifically designed for high-anxiety moments. Try it.",
    "Are you in physical danger right now? If not, then everything you're feeling is survivable. The brain makes stress feel existential — it rarely is.",
    "When stress feels overwhelming, name it: 'I am feeling overwhelmed by X.' This engages your prefrontal cortex — the rational brain — and takes the volume down on the amygdala.",
    "You managed stress at some point without alcohol — even if it was long ago. Those pathways are still there. We're rebuilding them right now.",
    "Alcohol didn't remove your stress — it postponed it with interest. Everything you were stressed about came back, plus shame and withdrawal. Sobriety means actually reducing the load.",
    "What is one thing on your stress list that you have actual control over? Start there. Just one thing.",
    "When everything feels urgent, nothing is being properly addressed. Triage your stress. What truly needs attention today?",
    "You deserve support with this. Not alcohol — actual support. Is there someone who can help you with what's causing the stress?",
    "Stress doesn't have to lead to drinking. It used to — because that was your only tool. You have more tools now. They're harder to use and they work better.",
    "Your brain is looking for relief. Give it some — legitimate relief. A walk, a meal, a bath, a journal entry. Not numbing. Relief.",
    "When stress peaks, the brain loses its ability to think long-term. Ground yourself first: 5 breaths, cold water, feet on the floor. Then think.",
    "This moment of stress is not permanent. I know it feels like it is. It isn't.",
    "You've handled hard things before — sober. Remember the last time something was difficult and you got through it without drinking. You did that.",
    "Sleep deprivation, hunger, and dehydration all amplify anxiety dramatically. Have you covered the basics today?",
    "It's okay to step away from what's stressing you for 20 minutes. You don't have to solve everything right now.",
    "Write down everything that's stressing you. All of it. Get it out of your brain and onto paper. Then look at the list. It's manageable. It's always more manageable on paper.",
    "Anxiety in recovery often comes from accumulated stress you never processed. You're doing the work now — even though it's uncomfortable.",
    "The stress will not kill you. Alcohol might. Keep perspective.",
    "What helped last time you were this stressed and stayed sober? Do that thing.",
    "You're stronger than you feel right now. Stress lies about that.",
    "Sometimes the most productive thing you can do is rest. Your nervous system needs to recover. Give it permission.",
    "Anxiety is often the body holding tension it hasn't had a chance to release. Try a full-body tense and release — tense every muscle for 5 seconds, then let go completely.",
    "When the stress feels like too much, reduce the timeframe. You don't have to handle everything. You just have to handle the next hour.",
    "Tell me — is this stress about something that's happening, or something you're afraid might happen? Those require very different responses.",
    "You are not your anxiety. The anxiety is a state your brain is in — not your identity. It will change.",
    "The Emergency Kit breathing exercises will help right now — not metaphorically but physically. Your breath controls your nervous system.",
    "One step at a time. One breath at a time. The stress is real and it's survivable.",
    "What would help most right now — to talk through the stress, or to focus on calming down first?",
    "You're doing the hardest version of life right now — feeling everything without a buffer. That is also the most honest version. And you're handling it.",
    "The stress doesn't need to be solved tonight. It needs to be felt and survived tonight. That's a different task — and you can do it.",
    "Is any of this stress something you'd feel better about tomorrow morning, sober and clear-headed? Because that's the version of you that can actually solve it.",
    "Anxiety peaks and then falls. Just like cravings. You don't have to fix the feeling — you just have to outlast it.",
    "Grounding exercise: name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste. Your nervous system responds to this.",
    "Breathe. You're still here. That's enough for right now.",
    "The stress is real. Your ability to handle it without alcohol is also real — even if it doesn't feel that way.",
    "What is the very next small action you can take? Not the solution — just the next step.",
    "You've been through worse. I know it doesn't feel like it. You have.",
    "Your sobriety is the greatest tool you have for reducing long-term stress. Alcohol would add to it. Hold on to that.",
    "Let's break this down. What's the single most pressing thing right now?",
    "You're not falling apart. You're feeling things. There's a difference.",
    "I'm here. Take a breath. Tell me what's going on.",
  ],

  // ── LONELINESS (50) ──────────────────────────────────────────────────────
  lonely: [
    "Loneliness in recovery is real and it's one of the hardest parts. The social world that drinking created — even if it was unhealthy — is gone, and the new world takes time to build.",
    "You reached out to me, and that matters. You are not completely alone — you chose connection over isolation. That's important.",
    "Loneliness is one of the top relapse triggers, and it makes sense — alcohol was social, it was the thing that made difficult social situations easier. Of course its absence feels isolating.",
    "The people you used to drink with — not all of them were real friends. Some of them were drinking companions. There's a difference. And the difference matters now.",
    "Building a sober social life takes time and it's uncomfortable and it's worth every moment of effort.",
    "Is there one person in your life — just one — who you trust enough to reach out to right now? Not to explain everything. Just to connect.",
    "What did you used to enjoy before alcohol became the centrepiece of social time? Those interests still exist. The people who share them exist too.",
    "Loneliness is a signal, not a sentence. It's telling you that you need more connection. That's important information — not a reason to give up.",
    "The silence of sobriety can feel enormous after years of using alcohol to fill it. But in that silence, you also start to hear yourself again. That's valuable.",
    "You don't have to be around people to not be alone. Connection can be a text, a voice note, a message to someone who cares.",
    "A lot of people in recovery find that the friendships they build after sobriety are the deepest they've ever had — because they're built on something real.",
    "What would help right now — distraction from the loneliness, or actually addressing the need for connection?",
    "The Sober Buddy is here. You're not talking to a wall. You're reaching out and being heard.",
    "Loneliness is amplified at night, on weekends, after work — the times when drinking used to happen. Knowing your high-risk times helps you plan for them.",
    "Have you considered any sober communities — online forums, local groups, anything? Not because you have to, but because others who understand make the loneliness smaller.",
    "The hardest part of sobriety isn't the not-drinking. For many people it's the social reconstruction. You're in the middle of that process right now.",
    "Who in your life knows you're sober? Even one person who's in your corner changes the texture of recovery.",
    "Loneliness is the absence of belonging, not the absence of people. Belonging comes from being known. Who knows the real you?",
    "Sometimes the loneliness of recovery is grief — grieving the social life that drinking created. It's okay to grieve it. It wasn't all bad, even if it was hurting you.",
    "What's one activity outside your home you could do this week that puts you near other people, even without pressure to socialise?",
    "You are not as alone as you feel. There are millions of people doing exactly what you're doing right now.",
    "The quiet is hard. I won't pretend it isn't. But in the quiet, healing is also happening.",
    "Text someone today. Anyone. You don't have to talk about recovery. Just reconnect. Human contact rewires the brain in ways nothing else can.",
    "Isolation and addiction feed each other. Connection and recovery feed each other. Choose the second pair.",
    "What would it look like to feel less alone this week? What's one concrete thing that could move you in that direction?",
    "You matter to people even when it doesn't feel like it. Depression and loneliness distort that reality. They make you feel more invisible than you are.",
    "The loneliness will not last forever. Sober friendships are slower to build and they last longer. You're in the building phase.",
    "Is there an online community you could connect with tonight? Forums, groups, anything? Sometimes just reading other people's stories breaks the isolation.",
    "You reached out here. That instinct — to seek connection when lonely — is healthy. Keep following it.",
    "Loneliness is a human need unmet, not a personal failing. You're not broken. You're just in a rebuilding phase.",
    "Who in your life could you call right now? Just to say hello. Not to talk about recovery. Just to hear a voice.",
    "The social architecture of your life is changing. That's uncomfortable and it's correct. What you're building will be more real than what you had.",
    "You don't have to explain everything to everyone. Sometimes connection is just being in the same room as another human being.",
    "Pets, music, walking in public spaces, libraries, community centres — connection doesn't always have to be a deep conversation.",
    "Your worth is not determined by how many people are around you tonight.",
    "This season of loneliness is temporary. Most people in recovery describe eventually finding deeper connection than they ever had while drinking.",
    "What do you wish someone would say to you right now? Say it to yourself. You are allowed to give yourself what you need.",
    "One thing that helps: acts of service. Doing something for someone else — even something small — breaks the spiral of self-focused loneliness.",
    "The evening hours are the hardest for loneliness. What could you do tonight to fill that time in a way that doesn't leave you feeling worse?",
    "You are known here. You are seen here. Even if it doesn't feel like enough, it is something.",
    "Connection is the opposite of addiction. You are already doing the opposite of addiction by reaching out right now.",
    "The silence between you and the people who care about you can be closed. You just have to send the first message.",
    "It won't always feel this lonely. I promise you that. Recovery builds a different kind of fullness — it takes time.",
    "You are not alone in your loneliness. Millions of people in recovery feel exactly this way. You are in good, struggling company.",
    "What one step could you take tomorrow to build more connection? Just one. Small is fine.",
    "The loneliness of sobriety is often the loneliness of growth — you've outgrown your old world and haven't fully arrived in the new one yet.",
    "Keep going. The world on the other side of this season has real people in it who will know the real you.",
    "You reached out. That's courage. Keep doing that — with me, with real people, with yourself.",
    "You deserve community. Real community. You're moving towards it even when it doesn't feel like it.",
    "I'm here. You're not alone right now.",
  ],

  // ── ANGER (40) ──────────────────────────────────────────────────────────
  anger: [
    "Anger in recovery is real and it's normal. You spent years numbing your emotions — now they're coming back full volume, and anger is often the loudest one.",
    "Your anger is valid. What's it about? Getting it out in words is healthier than letting it build inside.",
    "The old response to anger was to drink it down. That's not available anymore — so the anger needs somewhere to go. Exercise, journaling, talking. What do you have access to right now?",
    "Anger is often grief or fear in disguise. What is underneath the anger? What are you really feeling?",
    "When anger hits, physical movement is the fastest relief. Walk, run, do push-ups, punch a pillow. Your body metabolises the adrenaline faster than your brain can.",
    "Before you act on anything while angry, wait. The rule in recovery is HALT — hungry, angry, lonely, tired. Address those basics before making any decisions.",
    "Your anger is not a reason to drink. I know it feels like it would help. It will make the anger worse and add shame to the list.",
    "Anger tells you that something matters to you — that a boundary was crossed, that something was unfair, that you have needs not being met. What is your anger telling you?",
    "Write it down. All of it. The most angry, unfair, frustrated thing you feel. On paper. Don't send it. Just get it out.",
    "You are allowed to be angry. You are not allowed to let the anger hurt you. There is a path between those two things.",
    "Take 10 deep breaths before you do anything else. Not to calm down — just to pause. The pause is where your better judgment lives.",
    "What would release some of this anger in a way that doesn't create more problems?",
    "Anger without alcohol has to find a different channel. That's uncomfortable and it's healthier than the alternative.",
    "The anger might be about one thing on the surface and something deeper underneath. You don't have to sort that out right now. Just don't act destructively.",
    "I hear you. You have every right to feel what you're feeling. What do you need right now?",
    "Sobriety doesn't mean becoming emotionless. You're allowed to be furious. The work is in choosing what to do with the fury.",
    "Sometimes the anger in recovery is actually anger at yourself — for the time lost, the things done, the pain caused. That anger is also valid.",
    "Who or what is this anger about? You don't have to forgive anyone today. You just have to not drink.",
    "Anger is energy. It can be channelled — into exercise, into creativity, into advocacy, into change. It doesn't have to be destructive.",
    "You are safe to feel this. The feeling won't kill you. Act on it and you'll feel worse.",
    "Let it out here — write it, say it, express it. Then let's look at what it's really about.",
    "The anger might be part of your healing. Grief goes through anger. So does recovery from a life spent numbing.",
    "What is one thing you can do with this energy that isn't self-destructive?",
    "Anger is allowed. Drinking because of anger is optional. And the option costs too much.",
    "Breathe through it. Move through it. It will not stay at this intensity.",
    "Tell me what happened. I'm listening.",
    "What would calm feel like right now? What would need to be different for you to feel even 10% calmer?",
    "This anger is not going to last forever. I know it feels permanent. It isn't.",
    "You're doing the hard work of feeling things fully. That's not weakness — it's the opposite.",
    "When you're ready, let's look at this together. There's usually a need underneath the anger that deserves attention.",
    "Anger at others is often easier to hold than anger at yourself or fear of the future. What's underneath this?",
    "You are more than this emotion. Let it move through you — not out through a bottle.",
    "The anger is real. It is valid. And it is survivable without a drink.",
    "Physical release: a hard walk, cold water, something you can legitimately throw or hit. Get the adrenaline out of your body.",
    "This feeling will pass. I know that's not what you want to hear right now. It will pass.",
    "What needs to change in your life so that this kind of anger has less power over you?",
    "You can be angry and sober at the same time. They are not mutually exclusive.",
    "When the anger settles — even a little — let's look at what it's protecting.",
    "I'm here. You can be angry. What do you need?",
    "You survived the craving. You can survive the anger.",
  ],

  // ── SADNESS / DEPRESSION (40) ────────────────────────────────────────────
  sad: [
    "I'm really glad you said something. Sadness in recovery is heavy — and it's real. You're not being dramatic. Let me be here with you in this.",
    "Depression and early sobriety often arrive together. Your brain is rebuilding its ability to produce natural dopamine and serotonin. The flatness you might feel is neurological — and it lifts.",
    "Alcohol was a depressant. I know it felt like it helped. But it was making the sadness deeper over the long term. Your brain is now — slowly — beginning to find its own joy again.",
    "What is the sadness about? Sometimes it's grief, sometimes it's exhaustion, sometimes it's the brain chemistry of early recovery. All of these are real.",
    "You don't have to be okay right now. You just have to not drink today. That's enough.",
    "The grey feeling — the flatness — that many people experience in early sobriety is called post-acute withdrawal syndrome. It's temporary. It has a name because it's common.",
    "When was the last time you felt okay? Not great — just okay? Hold onto that memory. It's proof that this feeling isn't permanent.",
    "Sadness needs sunlight, movement, and connection — three things alcohol actively suppresses. Your instinct to reach out here is the right instinct.",
    "I hear you. I'm not going to tell you to cheer up or look on the bright side. I'm going to sit here with you in this and not flinch.",
    "Are you sleeping? Eating? Getting outside at all? The basics matter enormously when the sadness is heavy.",
    "If the sadness has been present for more than two weeks, please consider talking to a doctor or counsellor. Depression in recovery is treatable, and you don't have to white-knuckle it alone.",
    "You are allowed to grieve what alcohol cost you. The time, the relationships, the version of yourself you could have been. That grief is legitimate.",
    "What's one small thing that might make today slightly less heavy? Not fix everything — just one small thing.",
    "Alcohol would pour petrol on the sadness right now. Whatever it promises, the morning would be darker. You know this.",
    "You are not broken. You are healing. Healing often looks like feeling worse before feeling better.",
    "The sadness is not a sign that sobriety is failing. It is often a sign that it's working — you're finally feeling what was numbed.",
    "What do you need right now — to be heard, to be distracted, to make a plan?",
    "You reached out. In the middle of feeling low, you reached out. That is not a small thing.",
    "Tell me what's going on. I want to understand what today has been like for you.",
    "Sunshine and physical movement are not clichés — they are the most evidence-based interventions for low mood that exist. Even 10 minutes outside changes brain chemistry.",
    "The hardest thing about sadness in recovery is that you can't just disappear into alcohol anymore. You have to sit in it. That is also how you move through it.",
    "You are not alone in feeling this way. Sadness is one of the most common companions of early recovery.",
    "Is there something specific that triggered this sadness, or is it more of a general heaviness?",
    "One day at a time means one sad day at a time too. This day will end. Tomorrow is a different chance.",
    "You don't have to perform wellness for anyone. You're allowed to be in a difficult season.",
    "Sometimes writing helps — not to solve anything but to externalise what's internal. What would you write if no one would ever read it?",
    "What do you miss? Sometimes naming what we miss helps us understand the sadness better.",
    "The fog lifts. I've seen it lift for people who were certain it never would. It lifts.",
    "Be gentle with yourself today. You are going through something hard. Gentleness is not weakness — it's medicine.",
    "What does the sadness feel like in your body? Where do you feel it? Sometimes connecting with the physical sensation helps process it.",
    "You deserve to feel better than this. And you will — not because I'm saying it, but because recovery works, even when it's slow.",
    "Can you do one thing for yourself today that is genuinely kind? Not productive, not useful. Just kind to yourself.",
    "The version of you that is okay is still inside you. They're resting while you do this hard work.",
    "I'm not going to minimise this. But I am going to say: you are stronger than this feeling.",
    "What's one thing you're looking forward to? Even something small, even something far away?",
    "You're still here. Still fighting. That matters, even on the days when nothing feels like it does.",
    "Tell me one thing that made you feel even slightly better recently — even just for a moment.",
    "Sadness is part of being human. In sobriety you feel it fully for the first time in maybe years. That's not regression. That's return.",
    "You are doing the hardest work. Please don't give up on yourself.",
    "I'm here with you. What do you need?",
  ],

  // ── BOREDOM (30) ────────────────────────────────────────────────────────
  bored: [
    "Boredom is one of the most underestimated relapse triggers in recovery. Alcohol filled time. Now you have to fill it differently — and that takes creativity and effort.",
    "The boredom you're feeling is real. But it's also temporary — it's the gap between the life you had and the life you're building. You're in the in-between.",
    "What used to excite you before alcohol became the main event? There are interests in your past that are waiting to be rediscovered.",
    "Boredom in early recovery often has an edge of restlessness to it — the brain looking for stimulation it used to get from drinking. Physical movement is the fastest fix.",
    "What's one new thing you've been thinking about trying but haven't? Today might be the day to start.",
    "The Mind Games section of the app was built for exactly this — boredom-induced cravings. Go distract your brain for 20 minutes.",
    "Is the boredom actually loneliness? They look similar from the inside.",
    "Boredom is the brain saying 'I need engagement.' What engages you — genuinely, not just numbs you?",
    "Some of the best things people discover about themselves in sobriety come out of boredom. The boredom forces you to find out what you actually enjoy.",
    "What could you do with the next two hours that would leave you feeling like you used your time well?",
    "Boredom is not dangerous by itself. It becomes dangerous when the brain offers alcohol as the solution. Notice that offer — and refuse it.",
    "Exercise is the single most effective tool for boredom in recovery. Walk, run, anything. Your brain chemistry will change within 15 minutes.",
    "Learn something. Read something. Make something. The brain that's building new neural pathways needs input.",
    "What are you good at that you haven't done in a while?",
    "The restless boredom of early recovery is your brain rebuilding its reward system. It's loud and uncomfortable. It passes.",
    "Could you do something for someone else today? Service — even small service — is one of the most effective antidotes to boredom and emptiness.",
    "What was the last thing you made or created? How long has it been?",
    "Boredom is a luxury problem in the sense that it means you're not in crisis. Use that space to build something.",
    "What would you do today if you knew you couldn't drink? What would fill the time?",
    "Sometimes boredom is the body asking for rest. Are you actually exhausted and calling it boredom?",
    "Get outside. Even for 10 minutes. The change of environment and natural light interrupts the boredom loop.",
    "Pick up something you put down when drinking took over — a hobby, a project, a creative pursuit.",
    "Boredom is time that hasn't been given a purpose yet. What purpose could you give it?",
    "The evenings are the hardest — that's when drinking used to happen. Plan them. Even roughly. Unplanned evenings are the enemy.",
    "What would your best self do with this time?",
    "Reach out to someone. Connection is the cure for almost everything.",
    "Boredom in recovery is temporary. The life you're building has colour in it. You're just not there yet.",
    "Start something you can finish tonight. Something small. A sense of accomplishment fights boredom.",
    "What is one thing you can do right now that is good for you?",
    "You're bored and you didn't drink. That's a win. Use it.",
  ],

  // ── SOCIAL PRESSURE (30) ────────────────────────────────────────────────
  pressure: [
    "Social pressure to drink is one of the hardest parts of sobriety — because it often comes from people you like. You don't have to explain yourself. 'I'm not drinking tonight' is a complete sentence.",
    "You don't owe anyone an explanation for your sobriety. You don't have to justify it, defend it, or prove anything. You are not drinking. Full stop.",
    "The people who push hardest when you say no are often the ones most uncomfortable with their own drinking. That's their issue, not yours.",
    "Practising your response before social events helps enormously: 'I'm on medication', 'I'm driving', 'I'm doing a dry month', or simply 'I'm good thanks'. Have your answer ready.",
    "Going to social events sober is hard — especially at first. You are allowed to leave early. You are allowed to have an exit plan. You are not obligated to stay until you're uncomfortable.",
    "Not all social environments are safe for your recovery right now. Choosing which ones to attend and which to skip is not weakness — it's wisdom.",
    "The people in your life who truly support you will respect your sobriety without pressure. Anyone who doesn't is showing you where they stand.",
    "You can hold a glass of sparkling water or juice and most people won't know or ask. There is no obligation to announce your sobriety.",
    "If someone is making you feel bad for not drinking, that says everything about them and nothing about you.",
    "The fear of social situations sober is real. The reality of social situations sober is usually more manageable than the fear. Most conversations don't require alcohol.",
    "How are you feeling about this situation — afraid, angry, tempted? Tell me what's actually happening.",
    "What specifically is the pressure? Someone actively pushing? Just the environment? Feeling out of place? The response depends on what it is.",
    "You do not need alcohol to be entertaining, interesting, or socially comfortable — even if it feels that way right now.",
    "Your personality didn't come from alcohol. Your humour, your warmth, your ability to connect — those are yours.",
    "Social anxiety without alcohol is real and valid. The answer is building tolerance to it, not avoiding every social situation forever.",
    "Sober socialising gets easier. The first time is the hardest. Then the next time is a little easier. It compounds.",
    "What is the social situation you're dealing with? Let's think through it together.",
    "You can say no. You have always been allowed to say no. That permission was always yours.",
    "If you need to leave, leave. Your sobriety outranks any social obligation.",
    "Telling a trusted person in the group that you're not drinking tonight can create an ally in the room.",
    "You are not less fun sober. You are more present, more real, more actually there.",
    "The social discomfort is temporary. The regret of drinking is not.",
    "You survived harder things than a party. This is manageable.",
    "What would help you feel more prepared for this social situation?",
    "Have an exit plan. Know how you're getting home. Have someone to text if it gets hard. Be prepared.",
    "The drinks are optional. The people you care about are not. You can have the people without the drinks.",
    "What is the worst that actually happens if people notice you're not drinking? Most people don't care as much as you fear.",
    "Your sobriety is not a social liability. It is a personal triumph. You don't have to wear it as a badge if you don't want to, but you don't have to be ashamed of it either.",
    "One word: boundary. You are allowed to have them. Recovery requires them.",
    "You've already done the hard thing. You didn't drink. That's what matters.",
  ],

  // ── SLEEP (30) ──────────────────────────────────────────────────────────
  sleep: [
    "Sleep problems in early recovery are extremely common — alcohol disrupts your REM sleep architecture, and it takes weeks to months to fully rebuild. This is temporary.",
    "Your brain is relearning how to fall asleep without chemical assistance. That process is uncomfortable and it is happening. Every sober night is a night of healing even when it doesn't feel like it.",
    "The 4-7-8 breath is one of the most powerful sleep triggers: breathe in for 4, hold for 7, out for 8. Do it 4 times. It activates your parasympathetic system.",
    "Avoid screens for an hour before bed if you can — the blue light suppresses melatonin and your sleep architecture is already compromised.",
    "The Night breathing pattern in the Emergency Kit is specifically designed for winding down before sleep. Go try it.",
    "What's keeping you awake — racing thoughts, physical restlessness, early waking?",
    "Alcohol suppressed REM sleep. Without it, you may be dreaming vividly for the first time in years — even nightmares. This is your brain recalibrating its sleep cycles. It normalises.",
    "Vivid alcohol dreams are very common in recovery — your brain processing what happened. They don't mean you want to drink. They're a sign of healing.",
    "A consistent sleep schedule — same bedtime, same wake time — is the single most effective tool for rebuilding sleep patterns. Even on weekends.",
    "Body scan meditation before sleep: mentally travel from your toes to your head, consciously relaxing each part. Your nervous system responds.",
    "Keep your room cool and dark. Your brain associates temperature drop with sleep onset. Physical environment matters.",
    "If you wake in the night and can't get back to sleep, don't fight it. Get up, do something calm for 20 minutes, then try again. Fighting sleeplessness makes it worse.",
    "Herbal teas — chamomile, valerian, passionflower — have genuine sedative properties and are a healthy replacement for alcohol's sedative effect.",
    "The anxiety that peaks at night in early recovery is neurological — GABA rebound. It settles. Every sober night settles it a little more.",
    "Write down everything on your mind before you try to sleep. Get it out of your head and onto paper. This tells your brain it doesn't have to hold it anymore.",
    "Exercise during the day is one of the best natural sleep aids. Even a 20-minute walk improves sleep quality that night.",
    "Sleep deprivation dramatically increases cravings and emotional volatility. Protecting your sleep is protecting your recovery.",
    "You might need more sleep than you think right now — your body is using sleep to heal. Give it the time.",
    "Avoid caffeine after 2pm. In recovery, your nervous system is more sensitive than usual.",
    "The Self-Compassion meditation in the Emergency Kit is gentle and calming — good for falling asleep to.",
    "Some people find that a warm bath or shower before bed triggers the body temperature drop that signals sleep.",
    "Magnesium supplements are worth looking into — they're commonly depleted in heavy drinkers and play a role in sleep quality.",
    "What works for you — silence, background sound, white noise? Create the environment that gives you the best chance.",
    "The sleep will improve. It always does. Your brain is doing the work even when you're lying awake.",
    "If the sleep problems are severe, please speak to a doctor. There are safe, non-addictive options that can bridge the gap in early recovery.",
    "You're doing everything right by not drinking. Even bad sleep sober is better than the false sleep alcohol creates.",
    "Gratitude journaling before bed shifts the brain from threat-scanning to appreciation — it changes what the brain does overnight.",
    "Every night you sleep sober, your brain's GABA receptors recover a little more. The process is real even if it's slow.",
    "What does your sleep routine look like right now? Let's see if there's something we can improve.",
    "You will sleep well again. I promise you that. Hold on.",
  ],

  // ── CELEBRATING / PROUD (30) ─────────────────────────────────────────────
  proud: [
    "You should be proud. Not in a cliché way — genuinely, deeply proud. What you've done is hard and real and it changes everything.",
    "Every single day you've stayed sober is a day your liver healed, your brain rebuilt, and your relationships had a chance. Those days compound.",
    "I'm proud of you. Not just for the milestone — for every quiet morning, every difficult evening, every craving you outlasted.",
    "This is real. The number is real. The person standing on the other side of those days is different — stronger, clearer, more themselves.",
    "What does it feel like? Not what should it feel like — what does it actually feel like for you right now?",
    "Celebrate this. Not with alcohol — but celebrate it. Tell someone. Do something that marks it. You earned this.",
    "Think about who you were on Day 1 versus today. That gap is entirely your doing. Nobody else showed up every day — you did.",
    "Your body has been healing in ways that are invisible to you — but they're real. Liver function, brain chemistry, cardiovascular health. It's all recovering.",
    "The streak matters. But what matters more is who you are becoming. And I can hear it in the way you talk now.",
    "You are proof that recovery is possible. On the days when this was hardest — you kept going anyway.",
    "What is the biggest change you've noticed in yourself since you started?",
    "The Milestone screen has a shareable card for this — you've earned it. Let people see what you've done.",
    "Not just days — what else has changed? Sleep? Relationships? Money? How you feel in the morning?",
    "Your brain has been rewiring itself while you lived your life. New pathways, new defaults, new automatic responses. This is neurological change.",
    "Tell me about your best moment in recovery so far. The moment you're most proud of.",
    "You've done something that many people never manage. Let that land. You did it.",
    "Who knows about your sobriety? Have you told anyone about this milestone?",
    "The person who nearly gave up on Day 4, or Day 12, or Day 47 — look at them now.",
    "What's your next milestone? Keep looking forward. You have so much still to gain.",
    "You are worth celebrating. This is worth celebrating. Please let it be celebrated.",
    "How do you feel physically compared to where you started?",
    "The difficult nights, the social situations you navigated, the cravings you surfed — all of that is in this number.",
    "Recovery looks good on you. I hope you can feel that.",
    "What are you most grateful for about your sobriety so far?",
    "You did it. Keep going. There is so much more ahead.",
    "Tell me about a relationship that has improved since you stopped drinking.",
    "You are the person who got here. Nobody carried you. You walked every one of those days.",
    "What would you say to someone who is on Day 1 right now?",
    "You are proof of what's possible. Remember that on the hard days to come.",
    "This is a big deal. You are a big deal. Well done.",
  ],

  // ── PHYSICAL SYMPTOMS (30) ──────────────────────────────────────────────
  physical: [
    "Physical symptoms in early recovery are your body doing hard work. Sweating, shaking, headaches, nausea — these are withdrawal. They're uncomfortable and they're a sign of healing.",
    "If you're experiencing severe tremors, seizures, confusion, or hallucinations — please seek medical attention immediately. Severe alcohol withdrawal can be medically serious.",
    "Headaches in early sobriety are extremely common — partly dehydration, partly the brain recalibrating blood flow without the dilating effect of alcohol. Water and rest.",
    "Your digestive system is healing. The stomach lining, the gut microbiome, the liver — all of them were under sustained attack and are now recovering.",
    "The fatigue many people feel in early recovery is real — your body is directing enormous resources to healing. Let it rest.",
    "Sweating is your body clearing alcohol metabolites. Stay hydrated. It passes.",
    "Shakiness and tremors in the first 72 hours are neurological — your GABA receptors are readjusting. They usually settle. If they're severe, see a doctor.",
    "Brain fog is one of the most frustrating symptoms of early recovery. Difficulty concentrating, poor memory, mental slowness — these improve significantly at 2 weeks, more at 1 month, more at 3 months.",
    "Your heart rate may be elevated in early withdrawal. Rest. Don't do intense exercise in the first few days. Let your cardiovascular system stabilise.",
    "Nausea in early recovery can be managed with ginger tea, small frequent meals, and staying horizontal if needed. It usually peaks in the first 48 hours and improves rapidly.",
    "Skin changes — puffiness, redness, blotchiness — are very common. As liver function improves, your skin will clear. Many people notice significant changes at the 1-month mark.",
    "Your eyes may look better already — alcohol causes inflammation in the conjunctiva. That clears quickly.",
    "Muscle aches and joint pain are common — partly due to dehydration and nutrient depletion. Magnesium and B vitamins are often depleted in heavy drinkers.",
    "The anxiety you're feeling has a physical component — your nervous system has become dependent on alcohol to manage GABA. It's rebuilding its own regulation. This takes weeks.",
    "How many days in are you? The symptom pattern varies significantly by stage.",
    "Eat. Even if you're not hungry. Your blood sugar is likely unstable and low blood sugar makes everything worse — cravings, anxiety, fatigue.",
    "Drink water. Seriously. Dehydration amplifies every withdrawal symptom by 30–50%.",
    "Sleep is when the most physical healing happens. Protect it.",
    "The physical discomfort will not last at this intensity. The peak of acute withdrawal is usually 48–72 hours.",
    "Your liver has already started reducing its inflammation. At 1 week, liver enzyme levels begin improving. At 1 month, significant liver fat is reduced.",
    "The sense of smell and taste returning is one of the earliest and most pleasant physical recoveries — usually noticeable in the first week.",
    "Vitamin B1 (thiamine) deficiency is common after heavy drinking — it contributes to brain fog, fatigue, and nerve pain. A B-complex supplement is worth considering.",
    "The physical symptoms are temporary and they are meaningful — they are the price of freedom, and they are worth paying.",
    "Have you spoken to a doctor about your withdrawal? If you're in significant discomfort, there are safe medications that can ease the process.",
    "The body heals remarkably quickly when alcohol is removed. The timeline is faster than most people expect.",
    "Your immune system, suppressed by years of drinking, is beginning to come back online. You may notice you're less susceptible to getting ill.",
    "Appetite changes are normal — some people eat a lot more, some much less, in early recovery. Both are fine. The metabolism is resetting.",
    "The physical healing is happening even when it doesn't feel like it. Trust the process.",
    "What's the specific symptom you're dealing with? Let me give you more targeted information.",
    "You are getting better. Even on the days that don't feel like it — you are getting better.",
  ],

  // ── MOTIVATION / IDENTITY (30) ──────────────────────────────────────────
  motivation: [
    "The reason you started this matters. What was it? Not the abstract reason — the specific moment, the specific feeling that made you decide.",
    "Motivation fluctuates. That's normal and it doesn't mean you've lost your way. Some days you have to act your way into the motivation rather than wait for it to arrive.",
    "The sober identity is built action by action, day by day. You are already further into it than you realise.",
    "Who are you without alcohol? Some people find this terrifying. Others find it liberating. Most find both. What are you finding?",
    "The version of you that drinks — is that who you actually are? Or is it a persona that alcohol created? Sobriety lets the real you emerge.",
    "You don't have to have it all figured out. You just have to not drink today.",
    "What does your life look like in one year if you stay sober? In five years? That vision is worth protecting.",
    "Motivation has a shape — it peaks early, drops in the middle weeks, and rebuilds as results become visible. You might be in the dip. That's normal.",
    "Act like the person you want to become, even before you feel like them. Identity follows behaviour.",
    "The My Motivation section of the app is worth spending time with — your reasons to quit, written in your own words. That's more powerful than anything I can say.",
    "What would the sober version of you be doing with your life that the drinking version wasn't?",
    "You are not giving something up. You are gaining everything that alcohol was taking.",
    "Motivation is replenished by evidence. Look for evidence that sobriety is working — better sleep, clearer mind, money saved, improved relationships. That's your fuel.",
    "The hardest part of any change is the middle — when the initial energy has gone and the results aren't fully visible yet. This is the zone where people quit. Don't quit.",
    "Your story is being written right now. What do you want it to say?",
    "What do the people who love you most see in you that you might not see in yourself?",
    "The person you are becoming — describe them. What are they like? What do they do?",
    "Your reasons to stay sober are in the app. Read them. Right now. Not later — now.",
    "Sobriety is not a sacrifice. It is a reclamation. Everything you lost to alcohol — time, health, money, relationships — is coming back.",
    "You are not defined by your worst period. You are defined by what you do now.",
    "What small evidence of progress can you see today — even tiny evidence?",
    "Recovery takes more courage than most people will ever need for anything. You have that courage. You're using it right now.",
    "The sober life is not a lesser life. It is a more fully inhabited life. You get to actually live it.",
    "What would you tell the version of yourself from one year ago?",
    "Keep your reasons visible. Write them on paper. Put them somewhere you'll see them. The motivation lives in remembering.",
    "You are building a life you don't need to escape from. That's not a small thing.",
    "What does the best version of you look like in five years? That person is built day by day.",
    "Your value as a person was never in a bottle. It was always in you.",
    "The question isn't 'can I do this?' You already know you can. The question is 'will I keep choosing to?' And you are.",
    "Keep going. The best is still ahead.",
  ],

  // ── GENERAL / GREETING (50) ─────────────────────────────────────────────
  general: [
    "Hey, good to hear from you. How are you doing today — what's on your mind?",
    "I'm here. Tell me what's going on for you today.",
    "What's coming up for you right now?",
    "How are you feeling today — really?",
    "Good to have you here. What do you need today?",
    "I'm listening. What's on your mind?",
    "Hey. How's today been?",
    "Talk to me. What's happening?",
    "How are you holding up?",
    "What's going on today?",
    "I'm here for whatever you need. What's coming up?",
    "Good to check in. How are you doing?",
    "Tell me about today.",
    "What do you need right now?",
    "How are you feeling about your sobriety today?",
    "What's the main thing on your mind right now?",
    "I'm glad you came here. What's going on?",
    "How has today been treating you?",
    "What would help most right now?",
    "Talk to me — what's happening in your world?",
    "I'm here. What do you need?",
    "How are you really doing today?",
    "What's the hardest thing about today?",
    "What's been good today, even if it's small?",
    "I'm listening. Start wherever feels right.",
    "What brought you here today?",
    "How are you feeling in your body right now?",
    "What's the mood today?",
    "What do you want to talk about?",
    "Good to hear from you. What's on your mind?",
    "Tell me about your day — what happened?",
    "How are you doing with everything?",
    "What's sitting heavy today?",
    "What's one thing you need right now?",
    "I'm here. What do you want to say?",
    "How's your head today?",
    "What feels most urgent right now?",
    "How are you handling things today?",
    "What would make today better?",
    "Talk to me. I'm listening.",
    "What's the energy like today?",
    "How are you sleeping? Eating? Feeling?",
    "What's the thing you most need to say right now?",
    "How is your recovery feeling today — strong, wobbly, somewhere in between?",
    "Good to see you here. What's going on?",
    "What's the most important thing you want me to know right now?",
    "I'm here, and I'm not going anywhere. What do you need?",
    "Tell me where you're at.",
    "What's today been like?",
    "I'm glad you're here. What do you need?",
  ],
};

// ── Detection Engine ──────────────────────────────────────────────────────────
function detectCategory(text: string): string {
  const t = text.toLowerCase();
  const match = (words: string[]) => words.some(w => t.includes(w));
  if (match(['craving','urge','want to drink','need a drink','tempted','really want','so tempted','dying for','gagging for','wave of','hard not to'])) return 'craving';
  if (match(['relapsed','slipped','drank','had a drink','fell off','failed','gave in','broke my','messed up','back to square','started again'])) return 'relapse';
  if (match(['stressed','overwhelmed','anxious','anxiety','panic','worried','can\'t cope','too much','pressure','freaking out','stressed out','work is','can\'t handle'])) return 'stress';
  if (match(['lonely','alone','isolated','no one','nobody','by myself','miss people','no friends','disconnected','cut off','empty'])) return 'lonely';
  if (match(['angry','furious','rage','pissed off','so angry','frustrated','hate','mad at','infuriating','can\'t stand','fed up'])) return 'anger';
  if (match(['sad','depressed','depression','low','down','hopeless','worthless','pointless','what\'s the point','crying','can\'t see the point','empty','flat','numb'])) return 'sad';
  if (match(['bored','boredom','nothing to do','killing time','restless','can\'t sit still','fidgety','wasting time','time to fill'])) return 'bored';
  if (match(['party','social','people drinking','everyone drinking','pushed to','pressure to drink','offered','they won\'t stop','event','function','wedding','braai'])) return 'pressure';
  if (match(['can\'t sleep','not sleeping','insomnia','wake up','waking','nightmares','sleep is','tired but','restless night','vivid dream'])) return 'sleep';
  if (match(['proud','milestone','days sober','weeks sober','months sober','anniversary','made it','achieved','celebrating','so happy about'])) return 'proud';
  if (match(['shaking','tremor','headache','nausea','sweating','dizzy','sick','vomiting','heart racing','withdrawal','physically','body feels','brain fog','can\'t think'])) return 'physical';
  if (match(['why bother','motivation','who am i','identity','lost myself','don\'t know who','purpose','meaning','point of this','give up','want to quit','can\'t do this'])) return 'motivation';
  return 'general';
}

const recentResponses: string[] = [];
function getResponse(category: string, name: string, soberDays: number): string {
  const pool = R[category] || R.general;
  const available = pool.filter(r => !recentResponses.includes(r));
  const source = available.length > 0 ? available : pool;
  const picked = source[Math.floor(Math.random() * source.length)];
  recentResponses.push(picked);
  if (recentResponses.length > 6) recentResponses.shift();
  return picked
    .replace(/\bfriend\b/g, name || 'friend')
    .replace('your soberDays days', soberDays > 0 ? `your ${soberDays} days` : 'your journey');
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const CHAT_PREFIX = 'buddy_chat_';
const MAX_CHATS = 20;

function loadAllSessions(): ChatSession[] {
  try {
    const keys = storageKeys().filter(k => k.startsWith(CHAT_PREFIX));
    const sessions: ChatSession[] = keys
      .map(k => { try { return JSON.parse(storageGet(k) || ''); } catch { return null; } })
      .filter(Boolean) as ChatSession[];
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  } catch { return []; }
}

function saveSession(session: ChatSession) {
  storageSet(CHAT_PREFIX + session.id, JSON.stringify(session));
  // Prune oldest beyond MAX_CHATS
  const keys = storageKeys().filter(k => k.startsWith(CHAT_PREFIX));
  if (keys.length > MAX_CHATS) {
    const sessions = loadAllSessions();
    const toDelete = sessions.slice(MAX_CHATS);
    toDelete.forEach(s => storageRemove(CHAT_PREFIX + s.id));
  }
}

function deleteSession(id: string) {
  storageRemove(CHAT_PREFIX + id);
}

// ── Format helpers ────────────────────────────────────────────────────────────
function formatSessionDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const sessionDay = new Date(d); sessionDay.setHours(0,0,0,0);
  const time = d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if (sessionDay.getTime() === today.getTime()) return `Today · ${time}`;
  if (sessionDay.getTime() === yesterday.getTime()) return `Yesterday · ${time}`;
  return d.toLocaleDateString('en-ZA',{day:'numeric',month:'short'}) + ` · ${time}`;
}

function sessionPreview(session: ChatSession): string {
  // Find the first buddy message after the greeting (index 1+) or fallback to greeting
  const firstReply = session.messages.find(m => m.role === 'assistant');
  if (!firstReply) return 'No messages yet';
  const text = firstReply.content;
  return text.length > 72 ? text.slice(0, 72) + '…' : text;
}

// ── Chat View ─────────────────────────────────────────────────────────────────
function ChatView({ session, profile, soberDays, emergencyMode, onBack }: {
  session: ChatSession;
  profile: UserProfile | null;
  soberDays: number;
  emergencyMode?: boolean;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const name = profile?.username || 'friend';

  // Save whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveSession({ ...session, messages });
    }
  }, [messages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text, timestamp: Date.now() }];
    setMessages(newMessages);
    setLoading(true);
    setTimeout(() => {
      const category = detectCategory(text);
      const reply = getResponse(category, name, soberDays);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
      setLoading(false);
    }, 800 + Math.random() * 700);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
        <button onClick={onBack} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">‹</button>
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">🌱</div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">Your Sober Buddy</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400"/>
            <div className="text-xs text-slate-400">Always here · fully private</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🌱</div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-teal-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm">🌱</div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-300 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            placeholder="Talk to your Sober Buddy..."
            rows={1} style={{maxHeight:'120px'}}
            className="flex-1 bg-slate-100 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-teal-500"/>
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-teal-600 disabled:bg-slate-200 flex items-center justify-center text-white transition-colors text-lg">
            ➤
          </button>
        </div>
        <div className="text-center text-slate-300 text-xs mt-2">Your conversations are private and never leave your device</div>
      </div>
    </div>
  );
}

// ── Main Component (History List + Chat) ──────────────────────────────────────
export default function SoberBuddyChat({ profile, soberDays, emergencyMode = false, onClose }: BuddyProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadAllSessions());
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const name = profile?.username || 'friend';

  // Emergency mode — jump straight into a new chat
  useEffect(() => {
    if (emergencyMode) {
      startNewChat();
    }
  }, []);

  function makeGreeting(): string {
    if (emergencyMode) return `Hey ${name}, I'm here. Take a breath — you did the right thing opening this. What's happening right now?`;
    if (soberDays > 0) return `Hey ${name} 👋 I'm your Sober Buddy. ${soberDays} days — that's real. I'm here to support you, not to judge you. How are you doing today?`;
    return `Hey ${name} 👋 I'm your Sober Buddy. I'm here to support you through this journey — whatever you need. How are you doing right now?`;
  }

  function startNewChat() {
    const id = Date.now().toString();
    const greeting: Message = { role: 'assistant', content: makeGreeting(), timestamp: Date.now() };
    const session: ChatSession = { id, startedAt: Date.now(), messages: [greeting] };
    saveSession(session);
    setSessions(loadAllSessions());
    setActiveSession(session);
  }

  function openSession(session: ChatSession) {
    setActiveSession(session);
  }

  function handleBack() {
    // Reload sessions in case new messages were saved
    setSessions(loadAllSessions());
    setActiveSession(null);
  }

  function handleDelete(id: string) {
    deleteSession(id);
    setSessions(loadAllSessions());
    setConfirmDelete(null);
  }

  // Show active chat
  if (activeSession) {
    return (
      <ChatView
        session={activeSession}
        profile={profile}
        soberDays={soberDays}
        emergencyMode={emergencyMode}
        onBack={handleBack}
      />
    );
  }

  // Show history list
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">🌱</div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">Your Sober Buddy</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400"/>
            <div className="text-xs text-slate-400">Always here · fully private</div>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="text-slate-400 p-1 text-xl">✕</button>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* New Chat */}
        <button onClick={startNewChat}
          className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-sm flex items-center justify-center gap-2">
          <span className="text-xl">💬</span> Start a New Chat
        </button>

        {/* Previous chats */}
        {sessions.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1 mb-2">Previous Chats</div>
            <div className="space-y-2">
              {sessions.map(session => (
                <div key={session.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button onClick={() => openSession(session)}
                    className="w-full text-left px-4 py-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-base flex-shrink-0 mt-0.5">🌱</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 mb-0.5">{formatSessionDate(session.startedAt)}</div>
                      <div className="text-slate-600 text-sm leading-snug line-clamp-2">{sessionPreview(session)}</div>
                      <div className="text-slate-300 text-xs mt-1">{session.messages.length} messages</div>
                    </div>
                    <span className="text-slate-300 text-lg mt-1">›</span>
                  </button>
                  <div className="border-t border-slate-50 px-4 py-2 flex justify-end">
                    <button onClick={() => setConfirmDelete(session.id)}
                      className="text-xs text-red-400 font-medium px-3 py-1 rounded-lg bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🌱</div>
            <div className="text-slate-500 font-medium text-sm">No chats yet</div>
            <div className="text-slate-400 text-xs mt-1">Start a new chat whenever you need support</div>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-t-3xl p-6 w-full border-t border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="text-slate-800 font-bold text-base mb-1">Delete this chat?</div>
            <div className="text-slate-500 text-sm mb-5">This conversation will be permanently deleted.</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmDelete(null)} className="py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="py-3.5 rounded-xl bg-red-500 text-white font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

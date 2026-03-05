import React from 'react';
import { Home, Heart, Hand, Volume2, Users, Clock } from 'lucide-react';

export interface MoodConfig {
  id: string;
  name: string;
  character: string;
  characterImage: string;
  color: string;
  bgColor: string;
  colorClass: string;
  feelings: { label: string; bodyPart: string }[];
  breathingType: 'cactus-arms' | 'root-breaths' | 'blow-petals' | 'warm-hands' | 'brave-breath' | 'slow-hands';
  breathingCycles: number;
  phrases: string[];
  planOptions: { label: string; icon: React.ReactNode }[];
  goodbyeMessage: string;
}

export const moodConfigs: Record<string, MoodConfig> = {
  'too-noisy': {
    id: 'too-noisy',
    name: 'Too Noisy / Too Much',
    character: 'Cobie',
    characterImage: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766413386700_7aa124ca.png',



    color: 'green',
    bgColor: 'bg-gradient-to-b from-green-50 to-green-100',
    colorClass: 'bg-green-500',
    feelings: [
      { label: 'Buzzing', bodyPart: 'head' },
      { label: 'Prickly', bodyPart: 'chest' },
      { label: 'Too loud inside', bodyPart: 'head' },
      { label: 'Want to hide', bodyPart: 'tummy' },
    ],
    breathingType: 'cactus-arms',
    breathingCycles: 4,
    phrases: ['Too much.', 'I need quiet.', 'Not talking yet.'],
    planOptions: [
      { label: 'Quiet corner', icon: React.createElement(Home, { className: 'w-6 h-6' }) },
      { label: 'Cuddle corner', icon: React.createElement(Heart, { className: 'w-6 h-6' }) },
    ],
    goodbyeMessage: 'You found your quiet. Well done.',
  },
  'worried': {
    id: 'worried',
    name: 'Worried Tummy',
    character: 'Tree',
    characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975725971_e2da54c5.jpeg',
    color: 'amber',
    bgColor: 'bg-gradient-to-b from-amber-50 to-amber-100',
    colorClass: 'bg-amber-600',
    feelings: [
      { label: 'Wobbly tummy', bodyPart: 'tummy' },
      { label: 'Racing thoughts', bodyPart: 'head' },
      { label: 'Tight chest', bodyPart: 'chest' },
      { label: 'Can\'t settle', bodyPart: 'legs' },
    ],
    breathingType: 'root-breaths',
    breathingCycles: 5,
    phrases: ['I\'m worried.', 'Stay with me.', 'Can we do the plan?'],
    planOptions: [
      { label: 'One cuddle then sleep', icon: React.createElement(Heart, { className: 'w-6 h-6' }) },
      { label: 'One song then sleep', icon: React.createElement(Volume2, { className: 'w-6 h-6' }) },
    ],
    goodbyeMessage: 'Your worries are held safe. Rest now.',
  },
  'cross': {
    id: 'cross',
    name: 'Cross and Fizzy',
    character: 'Tilda',
    characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975726826_0beec93f.jpeg',
    color: 'yellow',
    bgColor: 'bg-gradient-to-b from-yellow-50 to-yellow-100',
    colorClass: 'bg-yellow-500',
    feelings: [
      { label: 'Hot and fizzy', bodyPart: 'chest' },
      { label: 'Hands want to hit', bodyPart: 'hands' },
      { label: 'Loud inside', bodyPart: 'head' },
      { label: 'Stompy feet', bodyPart: 'legs' },
    ],
    breathingType: 'blow-petals',
    breathingCycles: 5,
    phrases: ['Stop.', 'I\'m cross.', 'I need space.'],
    planOptions: [
      { label: 'Hands to yourself', icon: React.createElement(Hand, { className: 'w-6 h-6' }) },
      { label: 'Ask for help', icon: React.createElement(Users, { className: 'w-6 h-6' }) },
    ],
    goodbyeMessage: 'You cooled down. That was strong and calm.',
  },
  'sad': {
    id: 'sad',
    name: 'Sad and Small',
    character: 'Livleen',
    characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975729555_36acf577.jpeg',
    color: 'pink',
    bgColor: 'bg-gradient-to-b from-pink-50 to-pink-100',
    colorClass: 'bg-pink-500',
    feelings: [
      { label: 'Heavy heart', bodyPart: 'chest' },
      { label: 'Droopy', bodyPart: 'tummy' },
      { label: 'Want to cry', bodyPart: 'head' },
      { label: 'Empty feeling', bodyPart: 'tummy' },
    ],
    breathingType: 'warm-hands',
    breathingCycles: 3,
    phrases: ['I feel sad.', 'I wanted it.', 'Can you stay?'],
    planOptions: [
      { label: 'Cuddle', icon: React.createElement(Heart, { className: 'w-6 h-6' }) },
      { label: 'Draw it', icon: React.createElement('svg', { className: 'w-6 h-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' })) },
    ],
    goodbyeMessage: 'Sad feelings are okay. You are loved.',
  },
  'shy': {
    id: 'shy',
    name: 'Shy and Stuck',
    character: 'Harper',
    characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975728735_367c8d09.jpeg',
    color: 'purple',
    bgColor: 'bg-gradient-to-b from-purple-50 to-purple-100',
    colorClass: 'bg-purple-500',
    feelings: [
      { label: 'Frozen', bodyPart: 'legs' },
      { label: 'Voice stuck', bodyPart: 'chest' },
      { label: 'Want to hide', bodyPart: 'tummy' },
      { label: 'Watching from far', bodyPart: 'head' },
    ],
    breathingType: 'brave-breath',
    breathingCycles: 4,
    phrases: ['Hello.', 'Can I play?', 'I\'m not ready yet.'],
    planOptions: [
      { label: 'Wave', icon: React.createElement(Hand, { className: 'w-6 h-6' }) },
      { label: 'Stand near', icon: React.createElement(Users, { className: 'w-6 h-6' }) },
    ],
    goodbyeMessage: 'Every tiny step is brave. You did it.',
  },
  'mine': {
    id: 'mine',
    name: 'Mine for Now',
    character: 'Dulcy',
    characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975729135_7fcfd120.jpeg',
    color: 'gray',
    bgColor: 'bg-gradient-to-b from-gray-50 to-gray-100',
    colorClass: 'bg-gray-500',
    feelings: [
      { label: 'Tight grip', bodyPart: 'hands' },
      { label: 'Not fair feeling', bodyPart: 'chest' },
      { label: 'Worried it\'s gone', bodyPart: 'tummy' },
      { label: 'Want it all', bodyPart: 'head' },
    ],
    breathingType: 'slow-hands',
    breathingCycles: 4,
    phrases: ['Mine for now.', 'You can have a turn.', 'When will it be my turn?'],
    planOptions: [
      { label: 'Timer for turns', icon: React.createElement(Clock, { className: 'w-6 h-6' }) },
      { label: 'Take turns together', icon: React.createElement(Users, { className: 'w-6 h-6' }) },
    ],
    goodbyeMessage: 'Fair turns help everyone. Good planning.',
  },
};

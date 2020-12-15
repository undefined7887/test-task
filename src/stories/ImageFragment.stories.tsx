import React from "react";

import { Story, Meta } from '@storybook/react/types-6-0';

import ImageFragment from '../components/ImageFragment/ImageFragment';

export default {
  title: 'Example/ImageFragment',
  component: ImageFragment,
} as Meta;

const Template: Story<null> = (args) => <ImageFragment {...args} />;

export const Default = Template.bind({});
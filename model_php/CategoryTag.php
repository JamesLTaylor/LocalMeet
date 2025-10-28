<?php

class CategoryTag {
    /** @var string */
    public $name;
    
    /** @var string */
    public $description;

    /**
     * @param array $options
     * @param string $options['name'] The name of the category tag
     * @param string $options['description'] The description of the category tag
     */
    public function __construct(array $options) {
        $this->name = $options['name'];
        $this->description = $options['description'] ?? '';
    }
}